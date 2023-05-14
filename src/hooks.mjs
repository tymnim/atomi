
import { Tracker, ReactiveVar, Scope } from "./core.mjs";

const NONE = Symbol("none");

export function reactive(func, ignoreAsync = false) {
  const oldScope = Tracker.currentScope;
  const currentScope = new Scope(func);
  Tracker.currentScope = currentScope;
  // NOTE: initial run; registers dependencies
  const ret = currentScope.execute();
  Tracker.currentScope = oldScope;
  if (ret instanceof Promise && !ignoreAsync) {
    return new Promise(resolve => ret.then(() => resolve(currentScope)));
  }

  return currentScope;
}

export function reactiveState(reactiveVar) {
  return [
    function get() {
      return reactiveVar.get();
    },
    function set(value) {
      return reactiveVar.set(value);
    },
    function fset(func) {
      // NOTE: none is normally not used. May return it back if do not want to trigger updates.
      // Usage case: you have an array of unique things in your array and you want to perform
      //             verification that the new item is unique or any other validation.
      // Code:
      //  setSomething((someThings, none) =>
      //    someThings.includes(thing) ? none : someThings.concat(thing)
      //  );
      // Code example is a little silly, but it maybe used for all kinds of functionality and
      // passing NONE allows to manually optimize your code
      const result = func(reactiveVar.value, NONE);
      if (result !== NONE) {
        return reactiveVar.set(result);
      }
    }
  ];
}

export function nonreactive(func) {
  const scope = Tracker.currentScope;
  Tracker.currentScope = null;
  const result = func();
  Tracker.currentScope = scope;
  return result;
}

function guardCondition(a, b) {
  return a !== b;
}
export function guard(func, condition = guardCondition) {
  const currentScope = Tracker.currentScope;
  const index = currentScope._currentGuard;
  if (currentScope.firstRun) {
    currentScope._guards[index] = new Scope((self) => {
      self.space.name = `-- ${index}#guard --`;
      self.space.atom = new atom(func());
      // NOTE: overriding self
      self.callback = async (self) => {
        const value = func();
        if (condition(value, self.space.atom.value)) {
          return await self.space.atom.set(value);
        }
      }
    });
  }

  const guardScope = currentScope._guards[index];
  Tracker.currentScope = guardScope;
  guardScope.execute();
  Tracker.currentScope = currentScope;
  currentScope._currentGuard++;
  return guardScope.space.atom.get();
}

export function atom(variable) {
  const reactiveVar = new ReactiveVar(variable);
  return new.target === undefined ? reactiveState(reactiveVar) : reactiveVar;
}

// LEGACY
// export function reactive(variable) {
//   if (variable instanceof Function) {
//     return reactiveFunction(variable);
//   }
//   const reactiveVar = new ReactiveVar(variable);
//   return new.target === undefined ? reactiveState(reactiveVar) : reactiveVar;
// }

export default reactive;

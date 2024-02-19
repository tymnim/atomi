// @ts-check
import { Tracker, ReactiveVar, Scope } from "./core.mjs";

const NONE = Symbol("none");

/**
 * @callback reactiveFunction
 * @param {Scope} scope
 * @returns {Promise<void>|void}
 *
 * @param {reactiveFunction}  func
 * @param {boolean}           ignoreAsync
 * @returns {Scope|Promise<Scope>}
 */
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

/**
 * @param {ReactiveVar} reactiveVar
 * @returns {[
 *            () => any,
 *            (newValue: any) => Promise,
 *            (callback: (currentValue: any, none: NONE) => (any|NONE)) => (Promise|void)
 *          ]}
 */
export function reactiveState(reactiveVar) {
  return [
    /**
     * A function. Is used to access a value of an atom. Registers current scope as a dependency if
     * one exists. The scope is triggered when value of the atom changes.
     *
     * @prop {ReactiveVar} reactiveVar
     * @returns {any}
     */
    Object.defineProperty(
      function get() {
        return reactiveVar.get();
      },
      "reactiveVar",
      { writable: false, enumerable: false, value: reactiveVar }
    ),
    /**
     * A function. Is used to update the value of an atom and triggers all scopes that
     * are registered as dependencies.
     *
     * @param {any} value - new value to be set to an atom.
     * @returns <Promise>
     */
    function set(value) {
      return reactiveVar.set(value);
    },
    /**
     * @callback setStateCallback
     * @param {any}  currentValue
     * @param {NONE} none
     * @returns {any|NONE}
     */

    /**
     * A function. Is used to update a value of an atom. Accepts a callback {setStateCallback}.
     * The return value of such callback will be set as a new value of the atom. All dependent
     * scopes are triggered. If {NONE} is returned no new value is set and no scopes are triggered.
     *
     * @param {setStateCallback} func
     * @returns {Promise|void}
     */
    function fset(func) {
      const result = func(reactiveVar.value, NONE);
      if (result !== NONE) {
        return reactiveVar.set(result);
      }
    }
  ];
}

/**
 *  A function. Is used to execute functions without a scope so inner atoms are not registered
 *  as dependencies
 *
 * @param {function} func
 * @returns {any}
 */
export function nonreactive(func) {
  const scope = Tracker.currentScope;
  Tracker.currentScope = null;
  const result = func();
  Tracker.currentScope = scope;
  return result;
}

/**
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
function eq(a, b) {
  return a !== b;
}

/**
 * Is used to guard reactive function changes or atom changes. Eg if an atom is used to store
 * a boolean value, when it's set to true multiple times you might not want to trigger
 * its dependency.
 * @example
 * const [booleanValue, setBooleanValue] = atom(false);
 * reactive(() => {
 *     console.log(guard(booleanValue))
 * })
 *
 * @param {function} func
 * @param {function(any, any):boolean} predicate
 * @returns {any}
 */
export function guard(func, predicate = eq) {
  const currentScope = Tracker.currentScope;
  const index = currentScope._currentGuard;
  if (currentScope.firstRun) {
    currentScope._guards[index] = new Scope(self => {
      self.space.name = `-- ${index}#guard --`;
      self.space.atom = new ReactiveVar(func());
      // NOTE: overriding self
      self.callback = async self => {
        const value = func();
        if (predicate(value, self.space.atom.value)) {
          return await self.space.atom.set(value);
        }
      };
    });
  }

  const guardScope = currentScope._guards[index];
  Tracker.currentScope = guardScope;
  guardScope.execute();
  Tracker.currentScope = currentScope;
  currentScope._currentGuard++;
  return guardScope.space.atom.get();
}

/**
 * An atom is used to store some state.
 * @example
 * const [vairable, setVariable, setVariableFn] = atom(initialValue);
 * const state = new atom(initialValue);
 * @template T
 * @param {T} [variable]
 */
export function atom(variable) {
  const reactiveVar = new ReactiveVar(variable);
  return new.target === undefined ? reactiveState(reactiveVar) : reactiveVar;
}

export default reactive;

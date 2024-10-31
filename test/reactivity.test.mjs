// @ts-check
import assert from "assert";
import { ReactiveVar, Scope } from "../src/core.mjs";
import { reactive, nonreactive, atom, guard } from "../src/hooks.mjs";

/**
 * @param {number} time - ms
 */
const wait = time => new Promise(resolve => setTimeout(resolve, time));

const reactiveVarTests = {
  "ReactiveVar": {
    "#set": () => {
      const reactiveVar = new ReactiveVar();
      reactiveVar.set("something");
      assert.equal(reactiveVar.get(), "something");
    },
    "#get": () => {
      const reactiveVar = new ReactiveVar();
      reactiveVar.set("something");
      assert.equal(reactiveVar.get(), "something");
    }
  }
};

const scopeTests = {
  "Scope": {
    "#firstRun": () => {
      let hasRun = false;
      const scope = new Scope(scope => {
        hasRun = true;
      });
      scope.execute();
      assert.equal(scope.firstRun, true);
      assert.equal(hasRun, true);
      scope.execute();
      assert.equal(scope.firstRun, false);
    }
  }
};

const hooksTests = {
  "atom": {
    "#get": () => {
      const [state] = atom(5);

      assert.equal(state(), 5);
    },
    "#set": () => {
      const [state, setState] = atom(5);
      assert.equal(state(), 5);
      setState(3);
      assert.equal(state(), 3);
    },
    "#fset": () => {
      const [state,,setState] = atom(5);
      setState(current => {
        assert.equal(current, 5);
        return 3;
      });
      assert.equal(state(), 3);
    },
    "#fset (none)": () => {
      const [state,,setState] = atom(3);
      setState((current, none) => {
        assert.equal(current, 3);
        return none;
      });
      assert.equal(state(), 3);
    },
    "#fset (none: scope dependand)": () => {
      const [state,,setState] = atom(3);
      return new Promise((resolve, reject) => {
        const scope = reactive(scope => {
          state();
          if (!scope.firstRun) {
            reject(new Error("Scope was executed"));
          }
        });
        setState((current, none) => {
          assert.equal(current, 3);
          return none;
        });
        setTimeout(() => {
          assert.equal(state(), 3);
          resolve();
        }, 500);
      });
    },
    "#fset (scope dependand: await for update)": async () => {
      const [state,,setState] = atom(3);
      const [depState, setDepState] = atom();
      assert.equal(depState(), undefined);
      const scope = await reactive(async scope => {
        const st = state();
        await wait(200);
        setDepState(st);
      });
      assert.equal(depState(), state());
      await setState(current => current + 1);
      assert.equal(depState(), state());
    },
    "#set (scope dependand: await for update)": async () => {
      const [state, setState] = atom(3);
      const [depState, setDepState] = atom();
      assert.equal(depState(), undefined);
      const scope = await reactive(async scope => {
        const st = state();
        await wait(200);
        setDepState(st);
      });
      assert.equal(depState(), state());
      await setState(4);
      await setState(5);
      assert.equal(depState(), state());
    }
  },
  "#reactive": {
    "Making sure reactiveFunction executes exactly once": async () => {
      const [state, setState] = atom(false);
      let timesExecuted = 0;
      const scope = reactive(() => {
        state();
        timesExecuted += 1;
      });
      assert.equal(timesExecuted, 1);
      await setState(true);
      assert.equal(timesExecuted, 2);
      await setState(true);
      assert.equal(timesExecuted, 3);
    },
    "Making sure reactiveFunction executes exactly once with multiple dependencies": async () => {
      const [state1, setState1] = atom(false);
      const [state2, setState2] = atom(false);
      let timesExecuted = 0;
      const scope = reactive(() => {
        state1();
        state2();
        timesExecuted += 1;
      });
      assert.equal(timesExecuted, 1);
      setState1(true);
      await setState2(true);
      assert.equal(timesExecuted, 2);
      setState2(true);
      await setState1(true);
      assert.equal(timesExecuted, 3);
    },
    "Chaining #reactive": async () => {
      const [A, setA] = atom(0);
      const [B, setB] = atom(0);
      const [C, setC] = atom(0);

      reactive(() => {
        const a = A();
        return wait(200).then(() => setB(a));
      });
      reactive(() => {
        const b = B();
        return wait(200).then(() => setC(b));
      });

      assert(A() === B() && B() === C(), "initial check");

      await setA(1);

      assert(A() === B() && B() === C(), "Chained reactive await failed");
    }
  },
  "#nonreactive": async () => {
    const [state, setState] = atom(false);
    const [trigger, setTrigger] = atom(0);
    let timesExecuted = 0;
    reactive(() => {
      nonreactive(state);
      trigger();
      timesExecuted++;
    });

    assert.equal(timesExecuted, 1, `#1 Should've executed 1, but did ${timesExecuted}`);
    await setState(false);
    assert.equal(timesExecuted, 1, `#2 Should've executed 1, but did ${timesExecuted}`);
    await setState(true);
    await setTrigger(1);
    assert.equal(timesExecuted, 2, `#3 Should've executed 2, but did ${timesExecuted}`);
  },
  "#guard": {
    "#guard single": async () => {
      const [state, setState] = atom(false);
      let timesExecuted = 0;
      reactive(() => {
        const val = guard(state);
        timesExecuted += 1;
      });
      assert.equal(timesExecuted, 1, `#1 Should've executed 1, but did ${timesExecuted}`);
      await setState(false);
      assert.equal(timesExecuted, 1, `#2 Should've executed 1, but did ${timesExecuted}`);
      await setState(true);
      assert.equal(timesExecuted, 2, `#3 Should've executed 2, but did ${timesExecuted}`);
      await setState(true);
      assert.equal(timesExecuted, 2, `#4 Should've executed 2, but did ${timesExecuted}`);
      await setState(false);
      assert.equal(timesExecuted, 3, `#5 Should've executed 3, but did ${timesExecuted}`);
    },
    "#guard with custom equal function": async () => {
      const [state, setState] = atom(0);
      let timesExecuted = 0;
      const scope = reactive(async scope => {
        const val = guard(state, (a, b) => parseInt(a) !== parseInt(b));
        timesExecuted += 1;
      });
      assert.equal(timesExecuted, 1, `#1 Should've executed 1, but did ${timesExecuted}`);
      await setState(0.5);
      assert.equal(timesExecuted, 1, `#2 Should've executed 1, but did ${timesExecuted}`);
      await setState(1);
      assert.equal(timesExecuted, 2, `#3 Should've executed 2, but did ${timesExecuted}`);
      await setState(1.5);
      assert.equal(timesExecuted, 2, `#4 Should've executed 2, but did ${timesExecuted}`);
      await setState(2);
      assert.equal(timesExecuted, 3, `#5 Should've executed 3, but did ${timesExecuted}`);
    },
    "#guard with multiple deps": async () => {
      const [state, setState] = atom(0);
      const [mul, setMul] = atom(1);
      let timesExecuted = 0;
      const scope = reactive(() => {
        const val = guard(() => state() * mul());
        assert.equal(val, nonreactive(() => state() * mul()));
        timesExecuted += 1;
      });
      assert.equal(timesExecuted, 1, `Should've executed 1, but did ${timesExecuted}`);
      await setState(1);
      assert.equal(timesExecuted, 2, `Should've executed 2, but did ${timesExecuted}`);
      await setMul(1);
      assert.equal(timesExecuted, 2, `Should've executed 2, but did ${timesExecuted}`);
      await Promise.all([setState(2), setMul(2)]);
      assert.equal(timesExecuted, 3, `Should've executed 3, but did ${timesExecuted}`);
      await Promise.all([setState(-1), setMul(-4)]);
      assert.equal(timesExecuted, 3, `Should've executed 3, but did ${timesExecuted}`);
      await Promise.all([setState(1), setMul(-4)]);
      assert.equal(timesExecuted, 4, `Should've executed 4, but did ${timesExecuted}`);
    },
    "multiple #guard in one scope": async () => {
      const [state, setState] = atom(0);
      const [mul, setMul] = atom(1);

      let timesExecuted = 0;
      const scope = reactive(scope => {
        scope.space.name = "-- the double guard --";
        const st = guard(state);
        const ml = guard(mul);
        assert.equal(st, nonreactive(state));
        assert.equal(ml, nonreactive(mul));
        timesExecuted += 1;
      });
      assert.equal(timesExecuted, 1, `Should've executed 1, but did ${timesExecuted}`);
      await setState(1);
      assert.equal(timesExecuted, 2, `Should've executed 2, but did ${timesExecuted}`);
      await setMul(1);
      assert.equal(timesExecuted, 2, `Should've executed 2, but did ${timesExecuted}`);
      await setMul(2);
      assert.equal(timesExecuted, 3, `Should've executed 3, but did ${timesExecuted}`);
      await Promise.all([setMul(4), setState(4)]);
      assert.equal(timesExecuted, 4, `Should've executed 4, but did ${timesExecuted}`);
      await Promise.all([setMul(4), setState(4)]);
      assert.equal(timesExecuted, 4, `Should've executed 4, but did ${timesExecuted}`);
    }
  }
};

export default {
  "Reactivity Core": {
    ...reactiveVarTests,
    ...scopeTests
  },
  "Hooks": hooksTests
};

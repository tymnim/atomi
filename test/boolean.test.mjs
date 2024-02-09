// @ts-check
import assert from "assert";
import { atom } from "../src/hooks.mjs";
import { not, id, is, lesser, greater, negative, positive } from "../src/booleans.mjs";
import { filter } from "../src/arrays.mjs";

export default {
  "Array Utils": {
    "#not": async () => {
      const [state,, setState] = atom(true);

      assert.equal(state(), true);
      await setState(not);
      assert.equal(state(), false);
    },
    "#id with filter": async () => {
      const [state,, setState] = atom([1, 0, 3, 0, 0, 5]);
      assert.deepEqual(state(), [1, 0, 3, 0, 0, 5]);
      await setState(filter(id));
      assert.deepEqual(state(), [1, 3, 5]);
    },
    "#is": async () => {
      const checkThree = is(3);
      assert.equal(checkThree(3), true);
      assert.equal(checkThree(2), false);
    },
    "#lesser with filter": async () => {
      const [state,, setState] = atom([1, 0, 3, 0, 0, 5]);
      assert.deepEqual(state(), [1, 0, 3, 0, 0, 5]);
      await setState(filter(lesser(5)));
      assert.deepEqual(state(), [1, 0, 3, 0, 0]);
    },
    "#greater with filter": async () => {
      const [state,, setState] = atom([1, 0, 3, 0, 0, 5]);
      assert.deepEqual(state(), [1, 0, 3, 0, 0, 5]);
      await setState(filter(greater(1)));
      assert.deepEqual(state(), [3, 5]);
    },
    "#negative with filter": async () => {
      const [state,, setState] = atom([-1, 0, 3, 0, 0, -5]);
      assert.deepEqual(state(), [-1, 0, 3, 0, 0, -5]);
      await setState(filter(negative));
      assert.deepEqual(state(), [-1, -5]);
    },
    "#positive with filter": async () => {
      const [state,, setState] = atom([-1, 0, 3, 0, 0, -5]);
      assert.deepEqual(state(), [-1, 0, 3, 0, 0, -5]);
      await setState(filter(positive));
      assert.deepEqual(state(), [3]);
    }
  }
};

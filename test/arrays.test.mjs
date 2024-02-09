// @ts-check
import assert from "assert";
import { atom } from "../src/hooks.mjs";
import {
  filter, map, prepend, append, insert, assignWhere, sort, asc, desc
} from "../src/arrays.mjs";
import { is } from "../src/booleans.mjs";
import { power } from "../src/numbers.mjs";

export default {
  "Array Utils": {
    "#filter": async () => {
      const [state,, setState] = atom([1, 2, 3, 4, 5, 6]);

      assert.deepEqual(state(), [1, 2, 3, 4, 5, 6]);
      await setState(filter(x => !(x % 2)));
      assert.deepEqual(state(), [2, 4, 6]);
    },
    "#map": async () => {
      const [state,, setState] = atom([1, 2, 3, 4, 5, 6]);

      assert.deepEqual(state(), [1, 2, 3, 4, 5, 6]);
      await setState(map(x => x + 1));
      assert.deepEqual(state(), [2, 3, 4, 5, 6, 7]);
    },
    "#prepend": async () => {
      const [state,, setState] = atom([1, 2, 3]);

      assert.deepEqual(state(), [1, 2, 3]);
      await setState(prepend(4, 5, 6));
      assert.deepEqual(state(), [4, 5, 6, 1, 2, 3]);
    },
    "#append": async () => {
      const [state,, setState] = atom([4, 5, 6]);

      assert.deepEqual(state(), [4, 5, 6]);
      await setState(append(1, 2, 3));
      assert.deepEqual(state(), [4, 5, 6, 1, 2, 3]);
    },
    "#insert": async () => {
      const [state,, setState] = atom([1, 2, 3, 4, 5, 6]);

      assert.deepEqual(state(), [1, 2, 3, 4, 5, 6]);
      await setState(insert(2, "three"));
      assert.deepEqual(state(), [1, 2, "three", 3, 4, 5, 6]);
    },
    "#assignWhere": async () => {
      const [state,, setState] = atom([1, 2, 3, 4, 5, 6]);

      assert.deepEqual(state(), [1, 2, 3, 4, 5, 6]);
      await setState(assignWhere(is(3), power(2)));
      // await setState(assignWhere(e => e === e, e => e * e));
      assert.deepEqual(state(), [1, 2, 9, 4, 5, 6]);
    },
    "#sort(asc)": async () => {
      const [state,, setState] = atom([2, 3, 5, 6, 1, 4]);

      assert.deepEqual(state(), [2, 3, 5, 6, 1, 4]);
      await setState(sort(asc));
      assert.deepEqual(state(), [1, 2, 3, 4, 5, 6]);
    },
    "#sort(desc)": async () => {
      const [state,, setState] = atom([1, 2, 3, 4, 5, 6]);

      assert.deepEqual(state(), [1, 2, 3, 4, 5, 6]);
      await setState(sort(desc));
      assert.deepEqual(state(), [6, 5, 4, 3, 2, 1]);
    }
  }
};

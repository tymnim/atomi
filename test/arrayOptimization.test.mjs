// @ts-check
import assert from "assert";
import { atom } from "../src/hooks.mjs";
import { omap, omapEnumerated } from "../src/arrayOptimizations.mjs";

export default {
  "omap": {
    async mutating() {
      const [arr,,setArr] = atom([1, 2, 3, 4, 5]);
      const iterations = [];
      const iterate = fn => (x, arr) => {
        const res = fn(x, arr);
        iterations.push([x, res]);

        return res;
      };
      const result = omap(arr, iterate(x => x + 1));

      assert.deepEqual(result(), [2, 3, 4, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]
      ]);

      await setArr(arr => {
        arr[2] = 6;
        return arr;
      });

      assert.deepEqual(result(), [2, 3, 7, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
        [6, 7]
      ]);

      await setArr(arr => {
        arr[0] = 0;
        return arr;
      });

      assert.deepEqual(result(), [1, 3, 7, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
        [6, 7], [0, 1]
      ]);
    },
    async moving() {
      const [arr,,setArr] = atom([1, 2, 3, 4, 5]);
      const iterations = [];
      const iterate = fn => (x, arr) => {
        const res = fn(x, arr);
        iterations.push([x, res]);

        return res;
      };
      const result = omap(arr, iterate(x => x + 1));

      assert.deepEqual(result(), [2, 3, 4, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]
      ]);

      await setArr(arr => {
        const a = arr[0];
        arr[0] = arr[2];
        arr[2] = a;
        return arr;
      });

      assert.deepEqual(result(), [4, 3, 2, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]
      ]);
    }
  },
  "omapEnumerated": {
    async mutating() {
      const [arr,,setArr] = atom([1, 2, 3, 4, 5]);
      const iterations = [];
      const iterate = fn => (x, arr) => {
        const res = fn(x, arr);
        iterations.push([x, res]);

        return res;
      };
      const result = omapEnumerated(arr, iterate(x => x + 1));

      assert.deepEqual(result(), [2, 3, 4, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]
      ]);

      await setArr(arr => {
        arr[2] = 6;
        return arr;
      });

      assert.deepEqual(result(), [2, 3, 7, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
        [6, 7]
      ]);

      await setArr(arr => {
        arr[0] = 0;
        return arr;
      });

      assert.deepEqual(result(), [1, 3, 7, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
        [6, 7], [0, 1]
      ]);

    },
    async moving() {
      const [arr,,setArr] = atom([1, 2, 3, 4, 5]);
      const iterations = [];
      const iterate = fn => (x, arr) => {
        const res = fn(x, arr);
        iterations.push([x, res]);

        return res;
      };
      const result = omapEnumerated(arr, iterate(x => x + 1));

      assert.deepEqual(result(), [2, 3, 4, 5, 6]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]
      ]);

      await setArr(arr => {
        const a = arr[0];
        arr[0] = arr[2];
        arr[2] = a;
        arr[5] = 9;
        return arr;
      });

      assert.deepEqual(result(), [4, 3, 2, 5, 6, 10]);
      assert.deepEqual(iterations, [
        [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
        [3, 4], [1, 2], [9, 10]
      ]);
    }
  }
};


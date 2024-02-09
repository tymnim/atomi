import assert from "assert";
import { atom } from "../src/hooks.mjs";
import { add, sub, dec, inc, power } from "../src/numbers.mjs";

export default {
  "Number Utils": {
    "#add": async () => {
      const [number,, setNumber] = atom(0);
      assert.equal(number(), 0);
      await setNumber(add(2));
      assert.equal(number(), 2);
      await setNumber(add(3));
      assert.equal(number(), 5);
    },
    "#sub": async () => {
      const [number,, setNumber] = atom(10);
      assert.equal(number(), 10);
      await setNumber(sub(5));
      assert.equal(number(), 5);
      await setNumber(sub(2));
      assert.equal(number(), 3);
    },
    "#inc": async () => {
      const [counter,, setCounter] = atom(0);
      assert.equal(counter(), 0);
      await setCounter(inc);
      assert.equal(counter(), 1);
      await setCounter(inc);
      assert.equal(counter(), 2);
    },
    "#dec": async () => {
      const [counter,, setCounter] = atom(3);
      assert.equal(counter(), 3);
      await setCounter(dec);
      assert.equal(counter(), 2);
      await setCounter(dec);
      assert.equal(counter(), 1);
    },
    "#power": async () => {
      const [number,, setNumber] = atom(2);
      assert.equal(number(), 2);
      await setNumber(power(2));
      assert.equal(number(), 4);
      await setNumber(power(2));
      assert.equal(number(), 16);
    }
  }
};

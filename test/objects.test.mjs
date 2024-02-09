import assert from "assert";
import { atom } from "../src/hooks.mjs";
import { assign } from "../src/objects.mjs";

export default {
  "Object Utils": {
    "#assign": async () => {
      const [person,, setPerson] = atom({ name: "tim" });

      await setPerson(assign({ name: "Tim" }));
      assert.deepEqual(person(), { name: "Tim" });
    }
  }
};

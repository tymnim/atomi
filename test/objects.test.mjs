import assert from "assert";
import { Tests, Test } from "unit-tester";

import { reactive, atom } from "../src/hooks.mjs";

import { assign } from "../src/objects.mjs";

export default [
  Tests("Object Utils",
    Test("#assign", async () => {
      const [person,, setPerson] = atom({ name: "tim" });

      await setPerson(assign({ name: "Tim" }));
      assert.deepEqual(person(), { name: "Tim" });
    })
  )
]

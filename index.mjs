// @ts-check

/**
 * @template T
 * @typedef {import('./src/hooks.mjs').Atom<T>} Atom<T>
 */

export { reactive, atom, nonreactive, guard } from "./src/hooks.mjs";
export { not, id, is, lesser, greater, negative, positive } from "./src/booleans.mjs";
export {
  filter, map, prepend, append, insert, assignWhere, sort, asc, desc
} from "./src/arrays.mjs";
export { omap, omapEnumerated, ofilter } from "./src/arrayOptimizations.mjs";
export { add, sub, dec, inc, power } from "./src/numbers.mjs";
export { assign } from "./src/objects.mjs";
export { Tracker, ReactiveVar, Scope } from "./src/core.mjs";


import { atom, reactive } from "./hooks.mjs";

/**
 * Creates a function reacting to changes in `arrayAtom` keeping track of previous changes, calling
 * `fn` callback only when the element mutates or its oposition in the array changes.
 *
 * @template Data
 * @template Result
 *
 * @param {function():Data[]}                       arrayAtom
 * @param {function(Data, number, Data[]):Result}   fn
 * @returns {function():Result[]} - atomic getter containing resulting array
 */
export function omapEnumerated(arrayAtom, fn) {
  let dataCache = [];
  /** @type {Result[]} */
  const initial = [];
  const [content, setContent] = atom(initial);
  reactive(() => {
    const array = arrayAtom();
    let changed = false;
    const oldCacheLength = dataCache.length;
    dataCache = array.map((data, index) => {
      if (dataCache[index]?.data === data && dataCache[index].index === index) {
        return dataCache[index];
      }
      changed = true;
      return { data, result: fn(data, index, array), index };
    });

    if (changed) {
      return setContent(dataCache.map(d => d.result));
    }
    else if (oldCacheLength !== dataCache.length) {
      return setContent(dataCache.map(d => d.result));
    }
  });
  return content;
}

/**
 * Creates a function reacting to changes in `arrayAtom` keeping track of previous changes, calling
 * `fn` callback only when the element mutates.
 *
 * @template Data
 * @template Result
 *
 * @param {function():Data[]}               arrayAtom
 * @param {function(Data, Data[]):Result}   fn
 * @returns {function():Result[]} - atomic getter containing resulting array
 */
export function omap(arrayAtom, fn) {
  let dataCache = [];
  /** @type {Result[]} */
  const initial = [];
  const [content, setContent] = atom(initial);
  reactive(() => {
    const array = arrayAtom();
    let changed = false;
    const oldCacheLength = dataCache.length;
    dataCache = array.map((data, index) => {
      if (dataCache[index]?.data === data) {
        return dataCache[index];
      }
      changed = true;
      const potentialMove = dataCache.find(d => d.data === data);
      if (potentialMove) {
        return potentialMove;
      }
      return { data, result: fn(data, array) };
    });

    if (changed) {
      return setContent(dataCache.map(d => d.result));
    }
    else if (oldCacheLength !== dataCache.length) {
      return setContent(dataCache.map(d => d.result));
    }
  });
  return content;
}

/**
 * Creates a function reacting to changes in `arrayAtom`, filtering them based on the `predicate`.
 * Returns atomic getter of filtered elements
 *
 * @template Data
 *
 * @param {function():Data[]}                       arrayAtom
 * @param {function(Data, number, Data[]):boolean}  predicate
 * @returns {function():Data[]} - atomic getter containing resulting array
 */
export function ofilter(arrayAtom, predicate) {
  return () => {
    return arrayAtom().filter(predicate);
  };
}


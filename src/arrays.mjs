// @ts-check

/**
 * @param {function(any, number): any} mapper
 * @returns {function(any[]): any[]}
 */
export function map(mapper) {
  return current => current.map(mapper);
}

/**
 * @param {function(any, number): boolean} predicate
 * @returns {function(any[]): any[]}
 */
export function filter(predicate) {
  return current => current.filter(predicate);
}

/**
 * @param {...any} values
 * @return {function(any[])}: any[]
 */
export function prepend(...values) {
  return current => [...values, ...current];
}

/**
 * @param {...any} values
 * @return {function(any[])}: any[]
 */
export function append(...values) {
  return current => [...current, ...values];
}

/**
 * @param {number}  at
 * @param {...any}  values
 * @returns {function(any[]): any[]}
 */
export function insert(at, ...values) {
  return current => [...current.slice(0, at), ...values, ...current.slice(at)];
}

/**
 * @param {function(any, number, any[]): boolean}   predicate
 * @param {any}                                     value
 * @returns {function(any[], symbol): any[]|symbol}
 */
export function assignWhere(predicate, value) {
  return (current, none) => {
    const index = current.findIndex(predicate);
    if (index >= 0) {
      Object.assign(current, { [index]: value(current[index]) });
      return current;
    }
    return none;
  };
}

/**
 * @param {function(any, any): number} compareFn
 * @returns {function(any[]): any[]}
 */
export function sort(compareFn) {
  return current => {
    current.sort(compareFn);
    return current;
  };
}

/**
 * @param {any} a
 * @param {any} b
 * @returns number
 */
export function asc(a, b) {
  return a > b && 1 || (a < b && -1) || 0;
}

/**
 * @param {any} a
 * @param {any} b
 * @returns number
 */
export function desc(a, b) {
  return a > b && -1 || (a < b && 1) || 0;
}

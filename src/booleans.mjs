// @ts-check

/**
 * @param {any} value
 * @returns boolean
 */
export function not(value) {
  return !value;
}

/**
 * @param {any} x
 * @returns {any}
 */
export function id(x) {
  return x;
}

/**
 * @param {any} x
 * @returns {function(any): boolean}
 */
export function is(x) {
  return value => value === x;
}

/**
 * @param {number} value
 * @returns {function(number): boolean}
 */
export function lesser(value) {
  return number => number < value;
}

/**
 * @param {number} value
 * @returns {function(number): boolean}
 */
export function greater(value) {
  return number => number > value;
}

/**
 * @param {number} value
 * @returns boolean
 */
export const negative = lesser(0);

/**
 * @param {number} value
 * @returns boolean
 */
export const positive = greater(0);

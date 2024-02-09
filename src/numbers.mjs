// @ts-check

/**
 * @param {number} number
 * @returns {function(number): number}
 */
export function add(number) {
  return current => current + number;
}

/**
 * @param {number} number
 * @returns {function(number): number}
 */
export function sub(number) {
  return current => current - number;
}

/**
 * @param {number} number
 * @returns {number}
 */
export const inc = add(1);

/**
 * @param {number} number
 * @returns Pnumber}
 */
export const dec = sub(1);

/**
 * @param {number} number
 * @returns {function(number): number}
 */
export function power(number) {
  return current => current ** number;
}

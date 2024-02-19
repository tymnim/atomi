// @ts-check

/**
 * @param {Object} value
 * @returns {function(Object): Object}
 */
export function assign(value) {
  return current => Object.assign(current, value);
}

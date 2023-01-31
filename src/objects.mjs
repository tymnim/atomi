
export function assign(value) {
  return current => Object.assign(current, value);
}

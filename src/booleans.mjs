
export function not(value) {
  return !value
}

export function id(x) {
  return x;
}

export function is(x) {
  return value => value === x;
}

export function lesser(value) {
  return (number) => number < value;
}

export function greater(value) {
  return (number) => number > value;
}

export const negative = lesser(0);
export const positive = greater(0);

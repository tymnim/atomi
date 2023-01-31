
export function add(number) {
  return (current) => current + number;
}

export function sub(number) {
  return (current) => current - number;
}

export const inc = add(1);
export const dec = sub(1);

export function power(number) {
  return (current) => current ** number;
}

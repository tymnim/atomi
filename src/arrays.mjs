
export function map(mapper) {
  return current => current.map(mapper);
}

export function filter(condition) {
  return current => current.filter(condition);
}

export function prepend(...values) {
  return current => [...values, ...current];
}

export function append(...values) {
  return current => [...current, ...values];
}

export function insert(at, ...values) {
  return current => [...current.slice(0, at), ...values, ...current.slice(at)];
}

// export function insert(at, ...values) {
//   return current => [...current.slice(0, at), ...values, ...current.slice(at)
// }

export function assignWhere(condition, value) {
  return (current, none) => {
    const index = current.findIndex(condition);
    if (index >= 0) {
      Object.assign(current, { [index]: value(current[index]) });
      return current;
    }
    return none;
  }
}

export function sort(sorter) {
  return current => {
    current.sort(sorter);
    return current;
  }
}

export function asc(a, b) {
  return a > b && 1 || (a < b && -1) || 0;
}

export function desc(a, b) {
  return a > b && -1 || (a < b && 1) || 0;
}

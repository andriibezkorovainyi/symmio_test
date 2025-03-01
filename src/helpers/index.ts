export function searchInsert<T>(
  array: T[],
  compareFn: (value: T, ...args: any) => number,
  ...args: any
): number {
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    const cmp = compareFn(array[mid], ...args);

    if (cmp === 0) {
      while (mid > 0 && compareFn(array[mid - 1], ...args) === 0) {
        mid--;
      }
      return mid;
    }

    if (cmp < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return left;
}

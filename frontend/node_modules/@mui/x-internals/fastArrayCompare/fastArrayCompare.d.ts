/**
 * A fast array comparison function that compares two arrays for equality.
 *
 * Assumes that the arrays are ordered and contain only primitive values.
 *
 * It is faster than `fastObjectShallowCompare` for arrays.
 *
 * Returns true for instance equality, even if inputs are not arrays.
 *
 * @returns true if arrays contain the same elements in the same order, false otherwise.
 */
export declare function fastArrayCompare<T extends any>(a: T, b: T): boolean;
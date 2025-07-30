/**
 * Fast shallow compare for objects.
 * @returns true if objects are equal.
 */
export declare function fastObjectShallowCompare<T extends Record<string, any> | null>(a: T, b: T): boolean;
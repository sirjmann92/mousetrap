export declare function isNumber(value: unknown): value is number;
export declare function isFunction(value: any): value is Function;
export declare function isObject<TObject = Record<PropertyKey, any>>(value: unknown): value is TObject;
export declare function localStorageAvailable(): boolean;
export declare function escapeRegExp(value: string): string;
/**
 * Follows the CSS specification behavior for min and max
 * If min > max, then the min have priority
 */
export declare const clamp: (value: number, min: number, max: number) => number;
/**
 * Create an array containing the range [from, to[
 */
export declare function range(from: number, to: number): number[];
/**
 * Create a random number generator from a seed. The seed
 * ensures that the random number generator produces the
 * same sequence of 'random' numbers on every render. It
 * returns a function that generates a random number between
 * a specified min and max.
 */
export declare function createRandomNumberGenerator(seed: number): (min: number, max: number) => number;
export declare function deepClone(obj: Record<string, any>): any;
/**
 * Mark a value as used so eslint doesn't complain. Use this instead
 * of a `eslint-disable-next-line react-hooks/exhaustive-deps` because
 * that hint disables checks on all values instead of just one.
 */
export declare function eslintUseValue(_: any): void;
export declare const runIf: (condition: boolean, fn: Function) => (params: unknown) => void;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clamp = void 0;
exports.createRandomNumberGenerator = createRandomNumberGenerator;
exports.deepClone = deepClone;
exports.escapeRegExp = escapeRegExp;
exports.eslintUseValue = eslintUseValue;
exports.isFunction = isFunction;
exports.isNumber = isNumber;
exports.isObject = isObject;
exports.localStorageAvailable = localStorageAvailable;
exports.range = range;
exports.runIf = void 0;
function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}
function isFunction(value) {
  return typeof value === 'function';
}
function isObject(value) {
  return typeof value === 'object' && value !== null;
}
function localStorageAvailable() {
  try {
    // Incognito mode might reject access to the localStorage for security reasons.
    // window isn't defined on Node.js
    // https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
    const key = '__some_random_key_you_are_not_going_to_use__';
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    return false;
  }
}
function escapeRegExp(value) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Follows the CSS specification behavior for min and max
 * If min > max, then the min have priority
 */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Create an array containing the range [from, to[
 */
exports.clamp = clamp;
function range(from, to) {
  return Array.from({
    length: to - from
  }).map((_, i) => from + i);
}

// Pseudo random number. See https://stackoverflow.com/a/47593316
function mulberry32(a) {
  return () => {
    /* eslint-disable */
    let t = a += 0x6d2b79f5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
    /* eslint-enable */
  };
}

/**
 * Create a random number generator from a seed. The seed
 * ensures that the random number generator produces the
 * same sequence of 'random' numbers on every render. It
 * returns a function that generates a random number between
 * a specified min and max.
 */
function createRandomNumberGenerator(seed) {
  const random = mulberry32(seed);
  return (min, max) => min + (max - min) * random();
}
function deepClone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Mark a value as used so eslint doesn't complain. Use this instead
 * of a `eslint-disable-next-line react-hooks/exhaustive-deps` because
 * that hint disables checks on all values instead of just one.
 */
function eslintUseValue(_) {}
const runIf = (condition, fn) => params => {
  if (condition) {
    fn(params);
  }
};
exports.runIf = runIf;
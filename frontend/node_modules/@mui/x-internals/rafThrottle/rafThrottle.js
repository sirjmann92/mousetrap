"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rafThrottle = rafThrottle;
/**
 *  Creates a throttled function that only invokes `fn` at most once per animation frame.
 *
 * @example
 * ```ts
 * const throttled = rafThrottle((value: number) => console.log(value));
 * window.addEventListener('scroll', (e) => throttled(e.target.scrollTop));
 * ```
 *
 * @param fn Callback function
 * @return The `requestAnimationFrame` throttled function
 */
function rafThrottle(fn) {
  let lastArgs;
  let rafRef;
  const later = () => {
    rafRef = null;
    fn(...lastArgs);
  };
  function throttled(...args) {
    lastArgs = args;
    if (!rafRef) {
      rafRef = requestAnimationFrame(later);
    }
  }
  throttled.clear = () => {
    if (rafRef) {
      cancelAnimationFrame(rafRef);
      rafRef = null;
    }
  };
  return throttled;
}
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRunOncePerLoop = useRunOncePerLoop;
var React = _interopRequireWildcard(require("react"));
function useRunOncePerLoop(callback, nextFrame = false) {
  const scheduledRef = React.useRef(false);
  const schedule = React.useCallback((...args) => {
    if (scheduledRef.current) {
      return;
    }
    scheduledRef.current = true;
    const runner = () => {
      scheduledRef.current = false;
      callback(...args);
    };
    if (nextFrame) {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(runner);
      }
      return;
    }
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(runner);
    } else {
      Promise.resolve().then(runner);
    }
  }, [callback, nextFrame]);
  return schedule;
}
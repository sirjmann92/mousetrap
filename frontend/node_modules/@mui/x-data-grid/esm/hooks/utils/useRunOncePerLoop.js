import * as React from 'react';
export function useRunOncePerLoop(callback, nextFrame = false) {
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
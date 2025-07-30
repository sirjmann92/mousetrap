"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridNativeEventListener = void 0;
var _useGridLogger = require("./useGridLogger");
var _useGridEvent = require("./useGridEvent");
const useGridNativeEventListener = (apiRef, ref, eventName, handler, options) => {
  const logger = (0, _useGridLogger.useGridLogger)(apiRef, 'useNativeEventListener');
  (0, _useGridEvent.useGridEventPriority)(apiRef, 'rootMount', () => {
    const targetElement = ref();
    if (!targetElement || !eventName) {
      return undefined;
    }
    logger.debug(`Binding native ${eventName} event`);
    targetElement.addEventListener(eventName, handler, options);
    return () => {
      logger.debug(`Clearing native ${eventName} event`);
      targetElement.removeEventListener(eventName, handler, options);
    };
  });
};
exports.useGridNativeEventListener = useGridNativeEventListener;
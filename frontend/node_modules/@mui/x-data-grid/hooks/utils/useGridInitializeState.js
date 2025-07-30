"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridInitializeState = void 0;
var React = _interopRequireWildcard(require("react"));
const useGridInitializeState = (initializer, privateApiRef, props, key) => {
  const previousKey = React.useRef(key);
  const isInitialized = React.useRef(false);
  if (key !== previousKey.current) {
    isInitialized.current = false;
    previousKey.current = key;
  }
  if (!isInitialized.current) {
    privateApiRef.current.state = initializer(privateApiRef.current.state, props, privateApiRef);
    isInitialized.current = true;
  }
};
exports.useGridInitializeState = useGridInitializeState;
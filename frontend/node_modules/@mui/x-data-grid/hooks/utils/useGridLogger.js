"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridLogger = useGridLogger;
var React = _interopRequireWildcard(require("react"));
function useGridLogger(privateApiRef, name) {
  const logger = React.useRef(null);
  if (logger.current) {
    return logger.current;
  }
  const newLogger = privateApiRef.current.getLogger(name);
  logger.current = newLogger;
  return newLogger;
}
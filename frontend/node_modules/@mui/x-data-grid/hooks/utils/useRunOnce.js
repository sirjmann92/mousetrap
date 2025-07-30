"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRunOnce = void 0;
var React = _interopRequireWildcard(require("react"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
const noop = () => {};

/**
 * Runs an effect once, when `condition` is true.
 */
const useRunOnce = (condition, effect) => {
  const didRun = React.useRef(false);
  (0, _useEnhancedEffect.default)(() => {
    if (didRun.current || !condition) {
      return noop;
    }
    didRun.current = true;
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didRun.current || condition]);
};
exports.useRunOnce = useRunOnce;
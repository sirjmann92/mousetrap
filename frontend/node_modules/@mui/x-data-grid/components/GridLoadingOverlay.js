"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridLoadingOverlay = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _GridOverlay = require("./containers/GridOverlay");
var _GridSkeletonLoadingOverlay = require("./GridSkeletonLoadingOverlay");
var _useGridApiContext = require("../hooks/utils/useGridApiContext");
var _hooks = require("../hooks");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["variant", "noRowsVariant", "style"];
const LOADING_VARIANTS = {
  'circular-progress': {
    component: rootProps => rootProps.slots.baseCircularProgress,
    style: {}
  },
  'linear-progress': {
    component: rootProps => rootProps.slots.baseLinearProgress,
    style: {
      display: 'block'
    }
  },
  skeleton: {
    component: () => _GridSkeletonLoadingOverlay.GridSkeletonLoadingOverlay,
    style: {
      display: 'block'
    }
  }
};
const GridLoadingOverlay = exports.GridLoadingOverlay = (0, _forwardRef.forwardRef)(function GridLoadingOverlay(props, ref) {
  const {
      variant = 'linear-progress',
      noRowsVariant = 'skeleton',
      style
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const rowsCount = (0, _hooks.useGridSelector)(apiRef, _hooks.gridRowCountSelector);
  const activeVariant = LOADING_VARIANTS[rowsCount === 0 ? noRowsVariant : variant];
  const Component = activeVariant.component(rootProps);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridOverlay.GridOverlay, (0, _extends2.default)({
    style: (0, _extends2.default)({}, activeVariant.style, style)
  }, other, {
    ref: ref,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Component, {})
  }));
});
if (process.env.NODE_ENV !== "production") GridLoadingOverlay.displayName = "GridLoadingOverlay";
process.env.NODE_ENV !== "production" ? GridLoadingOverlay.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The variant of the overlay when no rows are displayed.
   * @default 'skeleton'
   */
  noRowsVariant: _propTypes.default.oneOf(['circular-progress', 'linear-progress', 'skeleton']),
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object]),
  /**
   * The variant of the overlay.
   * @default 'linear-progress'
   */
  variant: _propTypes.default.oneOf(['circular-progress', 'linear-progress', 'skeleton'])
} : void 0;
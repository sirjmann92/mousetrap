"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuickFilterTrigger = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _QuickFilterContext = require("./QuickFilterContext");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "className", "onClick"];
/**
 * A button that expands/collapses the quick filter.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilterTrigger API](https://mui.com/x/api/data-grid/quick-filter-trigger/)
 */
const QuickFilterTrigger = exports.QuickFilterTrigger = (0, _forwardRef.forwardRef)(function QuickFilterTrigger(props, ref) {
  const {
      render,
      className,
      onClick
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
    state,
    controlId,
    onExpandedChange,
    triggerRef
  } = (0, _QuickFilterContext.useQuickFilterContext)();
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const handleRef = (0, _useForkRef.default)(triggerRef, ref);
  const handleClick = event => {
    onExpandedChange(!state.expanded);
    onClick?.(event);
  };
  const element = (0, _useComponentRenderer.useComponentRenderer)(rootProps.slots.baseButton, render, (0, _extends2.default)({}, rootProps.slotProps?.baseButton, {
    className: resolvedClassName,
    'aria-controls': controlId,
    'aria-expanded': state.expanded
  }, other, {
    onClick: handleClick,
    ref: handleRef
  }), state);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") QuickFilterTrigger.displayName = "QuickFilterTrigger";
process.env.NODE_ENV !== "production" ? QuickFilterTrigger.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  className: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string]),
  disabled: _propTypes.default.bool,
  id: _propTypes.default.string,
  /**
   * A function to customize rendering of the component.
   */
  render: _propTypes.default.oneOfType([_propTypes.default.element, _propTypes.default.func]),
  role: _propTypes.default.string,
  size: _propTypes.default.oneOf(['large', 'medium', 'small']),
  startIcon: _propTypes.default.node,
  style: _propTypes.default.object,
  tabIndex: _propTypes.default.number,
  title: _propTypes.default.string,
  touchRippleRef: _propTypes.default.any
} : void 0;
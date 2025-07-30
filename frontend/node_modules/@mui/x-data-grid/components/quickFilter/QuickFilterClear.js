"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuickFilterClear = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _QuickFilterContext = require("./QuickFilterContext");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "className", "onClick"];
/**
 * A button that resets the filter value.
 * It renders the `baseIconButton` slot.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilterClear API](https://mui.com/x/api/data-grid/quick-filter-clear/)
 */
const QuickFilterClear = exports.QuickFilterClear = (0, _forwardRef.forwardRef)(function QuickFilterClear(props, ref) {
  const {
      render,
      className,
      onClick
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
    state,
    clearValue
  } = (0, _QuickFilterContext.useQuickFilterContext)();
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const handleClick = event => {
    clearValue();
    onClick?.(event);
  };
  const element = (0, _useComponentRenderer.useComponentRenderer)(rootProps.slots.baseIconButton, render, (0, _extends2.default)({}, rootProps.slotProps?.baseIconButton, {
    className: resolvedClassName,
    tabIndex: -1
  }, other, {
    onClick: handleClick,
    ref
  }), state);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") QuickFilterClear.displayName = "QuickFilterClear";
process.env.NODE_ENV !== "production" ? QuickFilterClear.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  className: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string]),
  color: _propTypes.default.oneOf(['default', 'inherit', 'primary']),
  disabled: _propTypes.default.bool,
  edge: _propTypes.default.oneOf(['end', 'start', false]),
  id: _propTypes.default.string,
  label: _propTypes.default.string,
  /**
   * A function to customize rendering of the component.
   */
  render: _propTypes.default.oneOfType([_propTypes.default.element, _propTypes.default.func]),
  role: _propTypes.default.string,
  size: _propTypes.default.oneOf(['large', 'medium', 'small']),
  style: _propTypes.default.object,
  tabIndex: _propTypes.default.number,
  title: _propTypes.default.string,
  touchRippleRef: _propTypes.default.any
} : void 0;
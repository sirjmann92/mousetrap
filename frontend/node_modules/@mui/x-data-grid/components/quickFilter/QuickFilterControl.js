"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuickFilterControl = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _QuickFilterContext = require("./QuickFilterContext");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "className", "slotProps", "onKeyDown", "onChange"];
/**
 * A component that takes user input and filters row data.
 * It renders the `baseTextField` slot.
 *
 * Demos:
 *
 * - [Quick Filter](https://mui.com/x/react-data-grid/components/quick-filter/)
 *
 * API:
 *
 * - [QuickFilterControl API](https://mui.com/x/api/data-grid/quick-filter-control/)
 */
const QuickFilterControl = exports.QuickFilterControl = (0, _forwardRef.forwardRef)(function QuickFilterControl(props, ref) {
  const {
      render,
      className,
      slotProps,
      onKeyDown,
      onChange
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const {
    state,
    controlId,
    controlRef,
    onValueChange,
    onExpandedChange,
    clearValue
  } = (0, _QuickFilterContext.useQuickFilterContext)();
  const resolvedClassName = typeof className === 'function' ? className(state) : className;
  const handleRef = (0, _useForkRef.default)(controlRef, ref);
  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      if (state.value === '') {
        onExpandedChange(false);
      } else {
        clearValue();
      }
    }
    onKeyDown?.(event);
  };
  const handleBlur = event => {
    if (state.value === '') {
      onExpandedChange(false);
    }
    slotProps?.htmlInput?.onBlur?.(event);
  };
  const handleChange = event => {
    if (!state.expanded) {
      onExpandedChange(true);
    }
    onValueChange(event);
    onChange?.(event);
  };
  const element = (0, _useComponentRenderer.useComponentRenderer)(rootProps.slots.baseTextField, render, (0, _extends2.default)({}, rootProps.slotProps?.baseTextField, {
    slotProps: (0, _extends2.default)({
      htmlInput: (0, _extends2.default)({
        role: 'searchbox',
        id: controlId,
        tabIndex: state.expanded ? undefined : -1
      }, slotProps?.htmlInput, {
        onBlur: handleBlur
      })
    }, slotProps),
    value: state.value,
    className: resolvedClassName
  }, other, {
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    ref: handleRef
  }), state);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") QuickFilterControl.displayName = "QuickFilterControl";
process.env.NODE_ENV !== "production" ? QuickFilterControl.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  autoComplete: _propTypes.default.string,
  autoFocus: _propTypes.default.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  className: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.string]),
  color: _propTypes.default.oneOf(['error', 'primary']),
  disabled: _propTypes.default.bool,
  error: _propTypes.default.bool,
  fullWidth: _propTypes.default.bool,
  helperText: _propTypes.default.string,
  id: _propTypes.default.string,
  inputRef: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.shape({
    current: _propTypes.default.object
  })]),
  label: _propTypes.default.node,
  multiline: _propTypes.default.bool,
  placeholder: _propTypes.default.string,
  /**
   * A function to customize rendering of the component.
   */
  render: _propTypes.default.oneOfType([_propTypes.default.element, _propTypes.default.func]),
  role: _propTypes.default.string,
  size: _propTypes.default.oneOf(['medium', 'small']),
  slotProps: _propTypes.default.object,
  style: _propTypes.default.object,
  tabIndex: _propTypes.default.number,
  type: _propTypes.default.oneOfType([_propTypes.default.oneOf(['button', 'checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week']), _propTypes.default.object]),
  value: _propTypes.default.string
} : void 0;
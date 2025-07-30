"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToolbarButton = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useComponentRenderer = require("@mui/x-internals/useComponentRenderer");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _ToolbarContext = require("./ToolbarContext");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["render", "onKeyDown", "onFocus", "disabled", "aria-disabled"];
/**
 * A button for performing actions from the toolbar.
 * It renders the `baseIconButton` slot.
 *
 * Demos:
 *
 * - [Toolbar](https://mui.com/x/react-data-grid/components/toolbar/)
 *
 * API:
 *
 * - [ToolbarButton API](https://mui.com/x/api/data-grid/toolbar-button/)
 */
const ToolbarButton = exports.ToolbarButton = (0, _forwardRef.forwardRef)(function ToolbarButton(props, ref) {
  const {
      render,
      onKeyDown,
      onFocus,
      disabled,
      'aria-disabled': ariaDisabled
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const id = (0, _useId.default)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const buttonRef = React.useRef(null);
  const handleRef = (0, _useForkRef.default)(buttonRef, ref);
  const {
    focusableItemId,
    registerItem,
    unregisterItem,
    onItemKeyDown,
    onItemFocus,
    onItemDisabled
  } = (0, _ToolbarContext.useToolbarContext)();
  const handleKeyDown = event => {
    onItemKeyDown(event);
    onKeyDown?.(event);
  };
  const handleFocus = event => {
    onItemFocus(id);
    onFocus?.(event);
  };
  React.useEffect(() => {
    registerItem(id, buttonRef);
    return () => unregisterItem(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const previousDisabled = React.useRef(disabled);
  React.useEffect(() => {
    if (previousDisabled.current !== disabled && disabled === true) {
      onItemDisabled(id, disabled);
    }
    previousDisabled.current = disabled;
  }, [disabled, id, onItemDisabled]);
  const previousAriaDisabled = React.useRef(ariaDisabled);
  React.useEffect(() => {
    if (previousAriaDisabled.current !== ariaDisabled && ariaDisabled === true) {
      onItemDisabled(id, true);
    }
    previousAriaDisabled.current = ariaDisabled;
  }, [ariaDisabled, id, onItemDisabled]);
  const element = (0, _useComponentRenderer.useComponentRenderer)(rootProps.slots.baseIconButton, render, (0, _extends2.default)({}, rootProps.slotProps?.baseIconButton, {
    tabIndex: focusableItemId === id ? 0 : -1
  }, other, {
    disabled,
    'aria-disabled': ariaDisabled,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    ref: handleRef
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ToolbarButton.displayName = "ToolbarButton";
process.env.NODE_ENV !== "production" ? ToolbarButton.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: _propTypes.default.string,
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
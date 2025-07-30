"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRegisterToolbarButton = useRegisterToolbarButton;
var React = _interopRequireWildcard(require("react"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _ToolbarContext = require("./ToolbarContext");
function useRegisterToolbarButton(props, ref) {
  const {
    onKeyDown,
    onFocus,
    disabled,
    'aria-disabled': ariaDisabled
  } = props;
  const id = (0, _useId.default)();
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
    registerItem(id, ref);
    return () => unregisterItem(id);
  }, [id, ref, registerItem, unregisterItem]);
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
  return {
    tabIndex: focusableItemId === id ? 0 : -1,
    disabled,
    'aria-disabled': ariaDisabled,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus
  };
}
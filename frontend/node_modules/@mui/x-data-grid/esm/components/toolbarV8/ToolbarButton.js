'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["render", "onKeyDown", "onFocus", "disabled", "aria-disabled"];
import * as React from 'react';
import PropTypes from 'prop-types';
import useForkRef from '@mui/utils/useForkRef';
import useId from '@mui/utils/useId';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useComponentRenderer } from '@mui/x-internals/useComponentRenderer';
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { useToolbarContext } from "./ToolbarContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
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
const ToolbarButton = forwardRef(function ToolbarButton(props, ref) {
  const {
      render,
      onKeyDown,
      onFocus,
      disabled,
      'aria-disabled': ariaDisabled
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const id = useId();
  const rootProps = useGridRootProps();
  const buttonRef = React.useRef(null);
  const handleRef = useForkRef(buttonRef, ref);
  const {
    focusableItemId,
    registerItem,
    unregisterItem,
    onItemKeyDown,
    onItemFocus,
    onItemDisabled
  } = useToolbarContext();
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
  const element = useComponentRenderer(rootProps.slots.baseIconButton, render, _extends({}, rootProps.slotProps?.baseIconButton, {
    tabIndex: focusableItemId === id ? 0 : -1
  }, other, {
    disabled,
    'aria-disabled': ariaDisabled,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    ref: handleRef
  }));
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ToolbarButton.displayName = "ToolbarButton";
process.env.NODE_ENV !== "production" ? ToolbarButton.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: PropTypes.string,
  color: PropTypes.oneOf(['default', 'inherit', 'primary']),
  disabled: PropTypes.bool,
  edge: PropTypes.oneOf(['end', 'start', false]),
  id: PropTypes.string,
  label: PropTypes.string,
  /**
   * A function to customize rendering of the component.
   */
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  role: PropTypes.string,
  size: PropTypes.oneOf(['large', 'medium', 'small']),
  style: PropTypes.object,
  tabIndex: PropTypes.number,
  title: PropTypes.string,
  touchRippleRef: PropTypes.any
} : void 0;
export { ToolbarButton };
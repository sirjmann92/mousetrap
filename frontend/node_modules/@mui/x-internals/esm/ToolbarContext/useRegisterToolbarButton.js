'use client';

import * as React from 'react';
import useId from '@mui/utils/useId';
import { useToolbarContext } from "./ToolbarContext.js";
export function useRegisterToolbarButton(props, ref) {
  const {
    onKeyDown,
    onFocus,
    disabled,
    'aria-disabled': ariaDisabled
  } = props;
  const id = useId();
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
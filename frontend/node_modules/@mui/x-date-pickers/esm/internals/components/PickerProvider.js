'use client';

import * as React from 'react';
import { LocalizationProvider } from "../../LocalizationProvider/index.js";
import { IsValidValueContext } from "../../hooks/useIsValidValue.js";
import { PickerFieldPrivateContext } from "../hooks/useNullableFieldPrivateContext.js";
import { PickerContext } from "../../hooks/usePickerContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
export const PickerActionsContext = /*#__PURE__*/React.createContext(null);
if (process.env.NODE_ENV !== "production") PickerActionsContext.displayName = "PickerActionsContext";
export const PickerPrivateContext = /*#__PURE__*/React.createContext({
  ownerState: {
    isPickerDisabled: false,
    isPickerReadOnly: false,
    isPickerValueEmpty: false,
    isPickerOpen: false,
    pickerVariant: 'desktop',
    pickerOrientation: 'portrait'
  },
  rootRefObject: {
    current: null
  },
  labelId: undefined,
  dismissViews: () => {},
  hasUIView: true,
  getCurrentViewMode: () => 'UI',
  triggerElement: null,
  viewContainerRole: null,
  defaultActionBarActions: [],
  onPopperExited: undefined
});

/**
 * Provides the context for the various parts of a Picker component:
 * - contextValue: the context for the Picker sub-components.
 * - localizationProvider: the translations passed through the props and through a parent LocalizationProvider.
 *
 * @ignore - do not document.
 */
if (process.env.NODE_ENV !== "production") PickerPrivateContext.displayName = "PickerPrivateContext";
export function PickerProvider(props) {
  const {
    contextValue,
    actionsContextValue,
    privateContextValue,
    fieldPrivateContextValue,
    isValidContextValue,
    localeText,
    children
  } = props;
  return /*#__PURE__*/_jsx(PickerContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(PickerActionsContext.Provider, {
      value: actionsContextValue,
      children: /*#__PURE__*/_jsx(PickerPrivateContext.Provider, {
        value: privateContextValue,
        children: /*#__PURE__*/_jsx(PickerFieldPrivateContext.Provider, {
          value: fieldPrivateContextValue,
          children: /*#__PURE__*/_jsx(IsValidValueContext.Provider, {
            value: isValidContextValue,
            children: /*#__PURE__*/_jsx(LocalizationProvider, {
              localeText: localeText,
              children: children
            })
          })
        })
      })
    })
  });
}
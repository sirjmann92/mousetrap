"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickerPrivateContext = exports.PickerActionsContext = void 0;
exports.PickerProvider = PickerProvider;
var React = _interopRequireWildcard(require("react"));
var _LocalizationProvider = require("../../LocalizationProvider");
var _useIsValidValue = require("../../hooks/useIsValidValue");
var _useNullableFieldPrivateContext = require("../hooks/useNullableFieldPrivateContext");
var _usePickerContext = require("../../hooks/usePickerContext");
var _jsxRuntime = require("react/jsx-runtime");
const PickerActionsContext = exports.PickerActionsContext = /*#__PURE__*/React.createContext(null);
if (process.env.NODE_ENV !== "production") PickerActionsContext.displayName = "PickerActionsContext";
const PickerPrivateContext = exports.PickerPrivateContext = /*#__PURE__*/React.createContext({
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
function PickerProvider(props) {
  const {
    contextValue,
    actionsContextValue,
    privateContextValue,
    fieldPrivateContextValue,
    isValidContextValue,
    localeText,
    children
  } = props;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_usePickerContext.PickerContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(PickerActionsContext.Provider, {
      value: actionsContextValue,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(PickerPrivateContext.Provider, {
        value: privateContextValue,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_useNullableFieldPrivateContext.PickerFieldPrivateContext.Provider, {
          value: fieldPrivateContextValue,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_useIsValidValue.IsValidValueContext.Provider, {
            value: isValidContextValue,
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_LocalizationProvider.LocalizationProvider, {
              localeText: localeText,
              children: children
            })
          })
        })
      })
    })
  });
}
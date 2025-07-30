"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerTextFieldOwnerState = exports.PickerTextFieldOwnerStateContext = void 0;
var React = _interopRequireWildcard(require("react"));
const PickerTextFieldOwnerStateContext = exports.PickerTextFieldOwnerStateContext = /*#__PURE__*/React.createContext(null);
if (process.env.NODE_ENV !== "production") PickerTextFieldOwnerStateContext.displayName = "PickerTextFieldOwnerStateContext";
const usePickerTextFieldOwnerState = () => {
  const value = React.useContext(PickerTextFieldOwnerStateContext);
  if (value == null) {
    throw new Error(['MUI X: The `usePickerTextFieldOwnerState` can only be called in components that are used inside a PickerTextField component'].join('\n'));
  }
  return value;
};
exports.usePickerTextFieldOwnerState = usePickerTextFieldOwnerState;
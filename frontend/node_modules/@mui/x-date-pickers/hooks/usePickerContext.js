"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerContext = exports.PickerContext = void 0;
var React = _interopRequireWildcard(require("react"));
const PickerContext = exports.PickerContext = /*#__PURE__*/React.createContext(null);

/**
 * Returns the context passed by the Picker wrapping the current component.
 */
if (process.env.NODE_ENV !== "production") PickerContext.displayName = "PickerContext";
const usePickerContext = () => {
  const value = React.useContext(PickerContext);
  if (value == null) {
    throw new Error('MUI X: The `usePickerContext` hook can only be called inside the context of a Picker component');
  }
  return value;
};
exports.usePickerContext = usePickerContext;
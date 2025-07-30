"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IsValidValueContext = void 0;
exports.useIsValidValue = useIsValidValue;
var React = _interopRequireWildcard(require("react"));
const IsValidValueContext = exports.IsValidValueContext = /*#__PURE__*/React.createContext(() => true);

/**
 * Returns a function to check if a value is valid according to the validation props passed to the parent Picker.
 */
if (process.env.NODE_ENV !== "production") IsValidValueContext.displayName = "IsValidValueContext";
function useIsValidValue() {
  return React.useContext(IsValidValueContext);
}
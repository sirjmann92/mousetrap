"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickerFieldPrivateContext = void 0;
exports.useNullableFieldPrivateContext = useNullableFieldPrivateContext;
var React = _interopRequireWildcard(require("react"));
const PickerFieldPrivateContext = exports.PickerFieldPrivateContext = /*#__PURE__*/React.createContext(null);
if (process.env.NODE_ENV !== "production") PickerFieldPrivateContext.displayName = "PickerFieldPrivateContext";
function useNullableFieldPrivateContext() {
  return React.useContext(PickerFieldPrivateContext);
}
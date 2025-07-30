"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useNullablePickerContext = void 0;
var React = _interopRequireWildcard(require("react"));
var _usePickerContext = require("../../hooks/usePickerContext");
/**
 * Returns the context passed by the Picker wrapping the current component.
 * If the context is not found, returns `null`.
 */
const useNullablePickerContext = () => React.useContext(_usePickerContext.PickerContext);
exports.useNullablePickerContext = useNullablePickerContext;
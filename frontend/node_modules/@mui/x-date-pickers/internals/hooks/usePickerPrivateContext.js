"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerPrivateContext = void 0;
var React = _interopRequireWildcard(require("react"));
var _PickerProvider = require("../components/PickerProvider");
/**
 * Returns the private context passed by the Picker wrapping the current component.
 */
const usePickerPrivateContext = () => React.useContext(_PickerProvider.PickerPrivateContext);
exports.usePickerPrivateContext = usePickerPrivateContext;
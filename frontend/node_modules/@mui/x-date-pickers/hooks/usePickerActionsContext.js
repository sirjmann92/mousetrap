"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePickerActionsContext = void 0;
var React = _interopRequireWildcard(require("react"));
var _PickerProvider = require("../internals/components/PickerProvider");
/**
 * Returns a subset of the context passed by the Picker wrapping the current component.
 * It only contains the actions and never causes a re-render of the component using it.
 */
const usePickerActionsContext = () => {
  const value = React.useContext(_PickerProvider.PickerActionsContext);
  if (value == null) {
    throw new Error(['MUI X: The `usePickerActionsContext` can only be called in fields that are used as a slot of a Picker component'].join('\n'));
  }
  return value;
};
exports.usePickerActionsContext = usePickerActionsContext;
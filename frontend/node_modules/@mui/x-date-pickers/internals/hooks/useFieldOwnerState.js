"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useFieldOwnerState = useFieldOwnerState;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _usePickerPrivateContext = require("./usePickerPrivateContext");
function useFieldOwnerState(parameters) {
  const {
    ownerState: pickerOwnerState
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const isRtl = (0, _RtlProvider.useRtl)();
  return React.useMemo(() => (0, _extends2.default)({}, pickerOwnerState, {
    isFieldDisabled: parameters.disabled ?? false,
    isFieldReadOnly: parameters.readOnly ?? false,
    isFieldRequired: parameters.required ?? false,
    fieldDirection: isRtl ? 'rtl' : 'ltr'
  }), [pickerOwnerState, parameters.disabled, parameters.readOnly, parameters.required, isRtl]);
}
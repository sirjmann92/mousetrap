"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useToolbarOwnerState = useToolbarOwnerState;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _usePickerPrivateContext = require("./usePickerPrivateContext");
function useToolbarOwnerState() {
  const {
    ownerState: pickerOwnerState
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const isRtl = (0, _RtlProvider.useRtl)();
  return React.useMemo(() => (0, _extends2.default)({}, pickerOwnerState, {
    toolbarDirection: isRtl ? 'rtl' : 'ltr'
  }), [pickerOwnerState, isRtl]);
}
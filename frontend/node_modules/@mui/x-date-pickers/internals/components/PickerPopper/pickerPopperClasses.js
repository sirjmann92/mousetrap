"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPickerPopperUtilityClass = getPickerPopperUtilityClass;
exports.pickerPopperClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getPickerPopperUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiPickerPopper', slot);
}
const pickerPopperClasses = exports.pickerPopperClasses = (0, _generateUtilityClasses.default)('MuiPickerPopper', ['root', 'paper']);
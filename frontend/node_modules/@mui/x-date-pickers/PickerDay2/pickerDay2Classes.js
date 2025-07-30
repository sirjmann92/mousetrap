"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPickerDay2UtilityClass = getPickerDay2UtilityClass;
exports.pickerDay2Classes = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getPickerDay2UtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiPickerDay2', slot);
}
const pickerDay2Classes = exports.pickerDay2Classes = (0, _generateUtilityClasses.default)('MuiPickerDay2', ['root', 'dayOutsideMonth', 'today', 'selected', 'disabled', 'fillerCell']);
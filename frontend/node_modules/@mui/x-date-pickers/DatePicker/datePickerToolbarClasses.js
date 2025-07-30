"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.datePickerToolbarClasses = void 0;
exports.getDatePickerToolbarUtilityClass = getDatePickerToolbarUtilityClass;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getDatePickerToolbarUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiDatePickerToolbar', slot);
}
const datePickerToolbarClasses = exports.datePickerToolbarClasses = (0, _generateUtilityClasses.default)('MuiDatePickerToolbar', ['root', 'title']);
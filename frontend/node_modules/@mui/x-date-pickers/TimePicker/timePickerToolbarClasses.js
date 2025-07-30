"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTimePickerToolbarUtilityClass = getTimePickerToolbarUtilityClass;
exports.timePickerToolbarClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getTimePickerToolbarUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiTimePickerToolbar', slot);
}
const timePickerToolbarClasses = exports.timePickerToolbarClasses = (0, _generateUtilityClasses.default)('MuiTimePickerToolbar', ['root', 'separator', 'hourMinuteLabel', 'hourMinuteLabelLandscape', 'hourMinuteLabelReverse', 'ampmSelection', 'ampmLandscape', 'ampmLabel']);
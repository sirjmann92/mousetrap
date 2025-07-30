"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dateTimePickerToolbarClasses = void 0;
exports.getDateTimePickerToolbarUtilityClass = getDateTimePickerToolbarUtilityClass;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getDateTimePickerToolbarUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiDateTimePickerToolbar', slot);
}
const dateTimePickerToolbarClasses = exports.dateTimePickerToolbarClasses = (0, _generateUtilityClasses.default)('MuiDateTimePickerToolbar', ['root', 'dateContainer', 'timeContainer', 'timeDigitsContainer', 'separator', 'timeLabelReverse', 'ampmSelection', 'ampmLandscape', 'ampmLabel']);
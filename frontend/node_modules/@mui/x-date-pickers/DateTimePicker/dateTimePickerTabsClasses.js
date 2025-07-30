"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dateTimePickerTabsClasses = void 0;
exports.getDateTimePickerTabsUtilityClass = getDateTimePickerTabsUtilityClass;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getDateTimePickerTabsUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiDateTimePickerTabs', slot);
}
const dateTimePickerTabsClasses = exports.dateTimePickerTabsClasses = (0, _generateUtilityClasses.default)('MuiDateTimePickerTabs', ['root']);
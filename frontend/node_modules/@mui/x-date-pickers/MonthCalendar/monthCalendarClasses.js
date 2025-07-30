"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMonthCalendarUtilityClass = getMonthCalendarUtilityClass;
exports.monthCalendarClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getMonthCalendarUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiMonthCalendar', slot);
}
const monthCalendarClasses = exports.monthCalendarClasses = (0, _generateUtilityClasses.default)('MuiMonthCalendar', ['root', 'button', 'disabled', 'selected']);
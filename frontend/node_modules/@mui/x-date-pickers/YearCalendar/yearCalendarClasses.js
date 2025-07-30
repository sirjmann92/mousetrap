"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getYearCalendarUtilityClass = getYearCalendarUtilityClass;
exports.yearCalendarClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getYearCalendarUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiYearCalendar', slot);
}
const yearCalendarClasses = exports.yearCalendarClasses = (0, _generateUtilityClasses.default)('MuiYearCalendar', ['root', 'button', 'disabled', 'selected']);
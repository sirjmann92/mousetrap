"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDayCalendarUtilityClass = exports.dayCalendarClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const getDayCalendarUtilityClass = slot => (0, _generateUtilityClass.default)('MuiDayCalendar', slot);
exports.getDayCalendarUtilityClass = getDayCalendarUtilityClass;
const dayCalendarClasses = exports.dayCalendarClasses = (0, _generateUtilityClasses.default)('MuiDayCalendar', ['root', 'header', 'weekDayLabel', 'loadingContainer', 'slideTransition', 'monthContainer', 'weekContainer', 'weekNumberLabel', 'weekNumber']);
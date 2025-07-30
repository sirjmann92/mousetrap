"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDateCalendarUtilityClass = exports.dateCalendarClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const getDateCalendarUtilityClass = slot => (0, _generateUtilityClass.default)('MuiDateCalendar', slot);
exports.getDateCalendarUtilityClass = getDateCalendarUtilityClass;
const dateCalendarClasses = exports.dateCalendarClasses = (0, _generateUtilityClasses.default)('MuiDateCalendar', ['root', 'viewTransitionContainer']);
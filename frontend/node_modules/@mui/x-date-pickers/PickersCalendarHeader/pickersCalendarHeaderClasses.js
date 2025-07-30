"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pickersCalendarHeaderClasses = exports.getPickersCalendarHeaderUtilityClass = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const getPickersCalendarHeaderUtilityClass = slot => (0, _generateUtilityClass.default)('MuiPickersCalendarHeader', slot);
exports.getPickersCalendarHeaderUtilityClass = getPickersCalendarHeaderUtilityClass;
const pickersCalendarHeaderClasses = exports.pickersCalendarHeaderClasses = (0, _generateUtilityClasses.default)('MuiPickersCalendarHeader', ['root', 'labelContainer', 'label', 'switchViewButton', 'switchViewIcon']);
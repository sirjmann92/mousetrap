"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTimeClockUtilityClass = getTimeClockUtilityClass;
exports.timeClockClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getTimeClockUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiTimeClock', slot);
}
const timeClockClasses = exports.timeClockClasses = (0, _generateUtilityClasses.default)('MuiTimeClock', ['root', 'arrowSwitcher']);
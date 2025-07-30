"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clockClasses = void 0;
exports.getClockUtilityClass = getClockUtilityClass;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getClockUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiClock', slot);
}
const clockClasses = exports.clockClasses = (0, _generateUtilityClasses.default)('MuiClock', ['root', 'clock', 'wrapper', 'squareMask', 'pin', 'amButton', 'pmButton', 'meridiemText', 'selected']);
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clockPointerClasses = void 0;
exports.getClockPointerUtilityClass = getClockPointerUtilityClass;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getClockPointerUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiClockPointer', slot);
}
const clockPointerClasses = exports.clockPointerClasses = (0, _generateUtilityClasses.default)('MuiClockPointer', ['root', 'thumb']);
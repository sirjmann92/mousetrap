"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clockNumberClasses = void 0;
exports.getClockNumberUtilityClass = getClockNumberUtilityClass;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getClockNumberUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiClockNumber', slot);
}
const clockNumberClasses = exports.clockNumberClasses = (0, _generateUtilityClasses.default)('MuiClockNumber', ['root', 'selected', 'disabled']);
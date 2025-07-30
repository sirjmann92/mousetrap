"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPickersToolbarTextUtilityClass = getPickersToolbarTextUtilityClass;
exports.pickersToolbarTextClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getPickersToolbarTextUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiPickersToolbarText', slot);
}
const pickersToolbarTextClasses = exports.pickersToolbarTextClasses = (0, _generateUtilityClasses.default)('MuiPickersToolbarText', ['root']);
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPickersToolbarButtonUtilityClass = getPickersToolbarButtonUtilityClass;
exports.pickersToolbarButtonClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getPickersToolbarButtonUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiPickersToolbarButton', slot);
}
const pickersToolbarButtonClasses = exports.pickersToolbarButtonClasses = (0, _generateUtilityClasses.default)('MuiPickersToolbarButton', ['root']);
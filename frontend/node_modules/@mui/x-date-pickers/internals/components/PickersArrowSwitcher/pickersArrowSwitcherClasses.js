"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPickersArrowSwitcherUtilityClass = getPickersArrowSwitcherUtilityClass;
exports.pickersArrowSwitcherClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getPickersArrowSwitcherUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiPickersArrowSwitcher', slot);
}
const pickersArrowSwitcherClasses = exports.pickersArrowSwitcherClasses = (0, _generateUtilityClasses.default)('MuiPickersArrowSwitcher', ['root', 'spacer', 'button', 'previousIconButton', 'nextIconButton', 'leftArrowIcon', 'rightArrowIcon']);
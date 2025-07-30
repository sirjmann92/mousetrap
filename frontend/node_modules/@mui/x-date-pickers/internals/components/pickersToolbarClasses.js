"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPickersToolbarUtilityClass = getPickersToolbarUtilityClass;
exports.pickersToolbarClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
function getPickersToolbarUtilityClass(slot) {
  return (0, _generateUtilityClass.default)('MuiPickersToolbar', slot);
}
const pickersToolbarClasses = exports.pickersToolbarClasses = (0, _generateUtilityClasses.default)('MuiPickersToolbar', ['root', 'title', 'content']);
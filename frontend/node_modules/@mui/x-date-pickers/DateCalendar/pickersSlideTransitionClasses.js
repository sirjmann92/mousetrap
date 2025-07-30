"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pickersSlideTransitionClasses = exports.getPickersSlideTransitionUtilityClass = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const getPickersSlideTransitionUtilityClass = slot => (0, _generateUtilityClass.default)('MuiPickersSlideTransition', slot);
exports.getPickersSlideTransitionUtilityClass = getPickersSlideTransitionUtilityClass;
const pickersSlideTransitionClasses = exports.pickersSlideTransitionClasses = (0, _generateUtilityClasses.default)('MuiPickersSlideTransition', ['root', 'slideEnter-left', 'slideEnter-right', 'slideEnterActive', 'slideExit', 'slideExitActiveLeft-left', 'slideExitActiveLeft-right']);
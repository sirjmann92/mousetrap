"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeGridClasses = composeGridClasses;
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _gridClasses = require("../constants/gridClasses");
function composeGridClasses(classes, slots) {
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
}
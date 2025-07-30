"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDayCalendarSkeletonUtilityClass = exports.dayCalendarSkeletonClasses = void 0;
var _generateUtilityClass = _interopRequireDefault(require("@mui/utils/generateUtilityClass"));
var _generateUtilityClasses = _interopRequireDefault(require("@mui/utils/generateUtilityClasses"));
const getDayCalendarSkeletonUtilityClass = slot => (0, _generateUtilityClass.default)('MuiDayCalendarSkeleton', slot);
exports.getDayCalendarSkeletonUtilityClass = getDayCalendarSkeletonUtilityClass;
const dayCalendarSkeletonClasses = exports.dayCalendarSkeletonClasses = (0, _generateUtilityClasses.default)('MuiDayCalendarSkeleton', ['root', 'week', 'daySkeleton']);
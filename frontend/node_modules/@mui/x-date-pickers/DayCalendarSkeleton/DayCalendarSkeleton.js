"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DayCalendarSkeleton = DayCalendarSkeleton;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Skeleton = _interopRequireDefault(require("@mui/material/Skeleton"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _dimensions = require("../internals/constants/dimensions");
var _dayCalendarSkeletonClasses = require("./dayCalendarSkeletonClasses");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className", "classes"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    week: ['week'],
    daySkeleton: ['daySkeleton']
  };
  return (0, _composeClasses.default)(slots, _dayCalendarSkeletonClasses.getDayCalendarSkeletonUtilityClass, classes);
};
const DayCalendarSkeletonRoot = (0, _styles.styled)('div', {
  name: 'MuiDayCalendarSkeleton',
  slot: 'Root'
})({
  alignSelf: 'start'
});
const DayCalendarSkeletonWeek = (0, _styles.styled)('div', {
  name: 'MuiDayCalendarSkeleton',
  slot: 'Week'
})({
  margin: `${_dimensions.DAY_MARGIN}px 0`,
  display: 'flex',
  justifyContent: 'center'
});
const DayCalendarSkeletonDay = (0, _styles.styled)(_Skeleton.default, {
  name: 'MuiDayCalendarSkeleton',
  slot: 'DaySkeleton'
})({
  margin: `0 ${_dimensions.DAY_MARGIN}px`,
  '&[data-day-in-month="0"]': {
    visibility: 'hidden'
  }
});
const monthMap = [[0, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 0, 0, 0]];

/**
 * Demos:
 *
 * - [DateCalendar](https://mui.com/x/react-date-pickers/date-calendar/)
 *
 * API:
 *
 * - [CalendarPickerSkeleton API](https://mui.com/x/api/date-pickers/calendar-picker-skeleton/)
 */
function DayCalendarSkeleton(inProps) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiDayCalendarSkeleton'
  });
  const {
      className,
      classes: classesProp
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const classes = useUtilityClasses(classesProp);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(DayCalendarSkeletonRoot, (0, _extends2.default)({
    className: (0, _clsx.default)(classes.root, className),
    ownerState: props
  }, other, {
    children: monthMap.map((week, index) => /*#__PURE__*/(0, _jsxRuntime.jsx)(DayCalendarSkeletonWeek, {
      className: classes.week,
      children: week.map((dayInMonth, index2) => /*#__PURE__*/(0, _jsxRuntime.jsx)(DayCalendarSkeletonDay, {
        variant: "circular",
        width: _dimensions.DAY_SIZE,
        height: _dimensions.DAY_SIZE,
        className: classes.daySkeleton,
        "data-day-in-month": dayInMonth
      }, index2))
    }, index))
  }));
}
process.env.NODE_ENV !== "production" ? DayCalendarSkeleton.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;
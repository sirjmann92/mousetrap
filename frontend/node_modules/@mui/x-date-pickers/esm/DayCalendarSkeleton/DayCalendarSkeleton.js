'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className", "classes"];
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Skeleton from '@mui/material/Skeleton';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { DAY_SIZE, DAY_MARGIN } from "../internals/constants/dimensions.js";
import { getDayCalendarSkeletonUtilityClass } from "./dayCalendarSkeletonClasses.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    week: ['week'],
    daySkeleton: ['daySkeleton']
  };
  return composeClasses(slots, getDayCalendarSkeletonUtilityClass, classes);
};
const DayCalendarSkeletonRoot = styled('div', {
  name: 'MuiDayCalendarSkeleton',
  slot: 'Root'
})({
  alignSelf: 'start'
});
const DayCalendarSkeletonWeek = styled('div', {
  name: 'MuiDayCalendarSkeleton',
  slot: 'Week'
})({
  margin: `${DAY_MARGIN}px 0`,
  display: 'flex',
  justifyContent: 'center'
});
const DayCalendarSkeletonDay = styled(Skeleton, {
  name: 'MuiDayCalendarSkeleton',
  slot: 'DaySkeleton'
})({
  margin: `0 ${DAY_MARGIN}px`,
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
  const props = useThemeProps({
    props: inProps,
    name: 'MuiDayCalendarSkeleton'
  });
  const {
      className,
      classes: classesProp
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const classes = useUtilityClasses(classesProp);
  return /*#__PURE__*/_jsx(DayCalendarSkeletonRoot, _extends({
    className: clsx(classes.root, className),
    ownerState: props
  }, other, {
    children: monthMap.map((week, index) => /*#__PURE__*/_jsx(DayCalendarSkeletonWeek, {
      className: classes.week,
      children: week.map((dayInMonth, index2) => /*#__PURE__*/_jsx(DayCalendarSkeletonDay, {
        variant: "circular",
        width: DAY_SIZE,
        height: DAY_SIZE,
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
  classes: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { DayCalendarSkeleton };
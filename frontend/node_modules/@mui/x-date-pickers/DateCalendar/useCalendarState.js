"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useCalendarState = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _useIsDateDisabled = require("./useIsDateDisabled");
var _valueManagers = require("../internals/utils/valueManagers");
var _getDefaultReferenceDate = require("../internals/utils/getDefaultReferenceDate");
var _dateUtils = require("../internals/utils/date-utils");
var _usePickerAdapter = require("../hooks/usePickerAdapter");
const createCalendarStateReducer = (reduceAnimations, adapter) => (state, action) => {
  switch (action.type) {
    case 'setVisibleDate':
      return (0, _extends2.default)({}, state, {
        slideDirection: action.direction,
        currentMonth: action.month,
        isMonthSwitchingAnimating: !adapter.isSameMonth(action.month, state.currentMonth) && !reduceAnimations && !action.skipAnimation,
        focusedDay: action.focusedDay
      });
    case 'changeMonthTimezone':
      {
        const newTimezone = action.newTimezone;
        if (adapter.getTimezone(state.currentMonth) === newTimezone) {
          return state;
        }
        let newCurrentMonth = adapter.setTimezone(state.currentMonth, newTimezone);
        if (adapter.getMonth(newCurrentMonth) !== adapter.getMonth(state.currentMonth)) {
          newCurrentMonth = adapter.setMonth(newCurrentMonth, adapter.getMonth(state.currentMonth));
        }
        return (0, _extends2.default)({}, state, {
          currentMonth: newCurrentMonth
        });
      }
    case 'finishMonthSwitchingAnimation':
      return (0, _extends2.default)({}, state, {
        isMonthSwitchingAnimating: false
      });
    default:
      throw new Error('missing support');
  }
};
const useCalendarState = params => {
  const {
    value,
    referenceDate: referenceDateProp,
    disableFuture,
    disablePast,
    maxDate,
    minDate,
    onMonthChange,
    onYearChange,
    reduceAnimations,
    shouldDisableDate,
    timezone,
    getCurrentMonthFromVisibleDate
  } = params;
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const reducerFn = React.useRef(createCalendarStateReducer(Boolean(reduceAnimations), adapter)).current;
  const referenceDate = React.useMemo(() => {
    return _valueManagers.singleItemValueManager.getInitialReferenceValue({
      value,
      adapter,
      timezone,
      props: params,
      referenceDate: referenceDateProp,
      granularity: _getDefaultReferenceDate.SECTION_TYPE_GRANULARITY.day
    });
  },
  // We want the `referenceDate` to update on prop and `timezone` change (https://github.com/mui/mui-x/issues/10804)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [referenceDateProp, timezone]);
  const [calendarState, dispatch] = React.useReducer(reducerFn, {
    isMonthSwitchingAnimating: false,
    focusedDay: referenceDate,
    currentMonth: adapter.startOfMonth(referenceDate),
    slideDirection: 'left'
  });
  const isDateDisabled = (0, _useIsDateDisabled.useIsDateDisabled)({
    shouldDisableDate,
    minDate,
    maxDate,
    disableFuture,
    disablePast,
    timezone
  });

  // Ensure that `calendarState.currentMonth` timezone is updated when `referenceDate` (or timezone changes)
  // https://github.com/mui/mui-x/issues/10804
  React.useEffect(() => {
    dispatch({
      type: 'changeMonthTimezone',
      newTimezone: adapter.getTimezone(referenceDate)
    });
  }, [referenceDate, adapter]);
  const setVisibleDate = (0, _useEventCallback.default)(({
    target,
    reason
  }) => {
    if (reason === 'cell-interaction' && calendarState.focusedDay != null && adapter.isSameDay(target, calendarState.focusedDay)) {
      return;
    }
    const skipAnimation = reason === 'cell-interaction';
    let month;
    let focusedDay;
    if (reason === 'cell-interaction') {
      month = getCurrentMonthFromVisibleDate(target, calendarState.currentMonth);
      focusedDay = target;
    } else {
      month = adapter.isSameMonth(target, calendarState.currentMonth) ? calendarState.currentMonth : adapter.startOfMonth(target);
      focusedDay = target;

      // If the date is disabled, we try to find a non-disabled date inside the same month.
      if (isDateDisabled(focusedDay)) {
        const startOfMonth = adapter.startOfMonth(target);
        const endOfMonth = adapter.endOfMonth(target);
        focusedDay = (0, _dateUtils.findClosestEnabledDate)({
          adapter,
          date: focusedDay,
          minDate: adapter.isBefore(minDate, startOfMonth) ? startOfMonth : minDate,
          maxDate: adapter.isAfter(maxDate, endOfMonth) ? endOfMonth : maxDate,
          disablePast,
          disableFuture,
          isDateDisabled,
          timezone
        });
      }
    }
    const hasChangedMonth = !adapter.isSameMonth(calendarState.currentMonth, month);
    const hasChangedYear = !adapter.isSameYear(calendarState.currentMonth, month);
    if (hasChangedMonth) {
      onMonthChange?.(month);
    }
    if (hasChangedYear) {
      onYearChange?.(adapter.startOfYear(month));
    }
    dispatch({
      type: 'setVisibleDate',
      month,
      direction: adapter.isAfterDay(month, calendarState.currentMonth) ? 'left' : 'right',
      focusedDay: calendarState.focusedDay != null && focusedDay != null && adapter.isSameDay(focusedDay, calendarState.focusedDay) ? calendarState.focusedDay : focusedDay,
      skipAnimation
    });
  });
  const onMonthSwitchingAnimationEnd = React.useCallback(() => {
    dispatch({
      type: 'finishMonthSwitchingAnimation'
    });
  }, []);
  return {
    referenceDate,
    calendarState,
    setVisibleDate,
    isDateDisabled,
    onMonthSwitchingAnimationEnd
  };
};
exports.useCalendarState = useCalendarState;
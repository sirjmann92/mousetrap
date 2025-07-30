"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DayCalendar = DayCalendar;
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _Typography = _interopRequireDefault(require("@mui/material/Typography"));
var _useSlotProps2 = _interopRequireDefault(require("@mui/utils/useSlotProps"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _clsx = _interopRequireDefault(require("clsx"));
var _PickersDay = require("../PickersDay");
var _hooks = require("../hooks");
var _useUtils = require("../internals/hooks/useUtils");
var _dimensions = require("../internals/constants/dimensions");
var _PickersSlideTransition = require("./PickersSlideTransition");
var _useIsDateDisabled = require("./useIsDateDisabled");
var _dateUtils = require("../internals/utils/date-utils");
var _dayCalendarClasses = require("./dayCalendarClasses");
var _usePickerDayOwnerState = require("../PickersDay/usePickerDayOwnerState");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["parentProps", "day", "focusedDay", "selectedDays", "isDateDisabled", "currentMonthNumber", "isViewFocused"],
  _excluded2 = ["ownerState"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    header: ['header'],
    weekDayLabel: ['weekDayLabel'],
    loadingContainer: ['loadingContainer'],
    slideTransition: ['slideTransition'],
    monthContainer: ['monthContainer'],
    weekContainer: ['weekContainer'],
    weekNumberLabel: ['weekNumberLabel'],
    weekNumber: ['weekNumber']
  };
  return (0, _composeClasses.default)(slots, _dayCalendarClasses.getDayCalendarUtilityClass, classes);
};
const weeksContainerHeight = (_dimensions.DAY_SIZE + _dimensions.DAY_MARGIN * 2) * 6;
const PickersCalendarDayRoot = (0, _styles.styled)('div', {
  name: 'MuiDayCalendar',
  slot: 'Root'
})({});
const PickersCalendarDayHeader = (0, _styles.styled)('div', {
  name: 'MuiDayCalendar',
  slot: 'Header'
})({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});
const PickersCalendarWeekDayLabel = (0, _styles.styled)(_Typography.default, {
  name: 'MuiDayCalendar',
  slot: 'WeekDayLabel'
})(({
  theme
}) => ({
  width: 36,
  height: 40,
  margin: '0 2px',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: (theme.vars || theme).palette.text.secondary
}));
const PickersCalendarWeekNumberLabel = (0, _styles.styled)(_Typography.default, {
  name: 'MuiDayCalendar',
  slot: 'WeekNumberLabel'
})(({
  theme
}) => ({
  width: 36,
  height: 40,
  margin: '0 2px',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: (theme.vars || theme).palette.text.disabled
}));
const PickersCalendarWeekNumber = (0, _styles.styled)(_Typography.default, {
  name: 'MuiDayCalendar',
  slot: 'WeekNumber'
})(({
  theme
}) => (0, _extends2.default)({}, theme.typography.caption, {
  width: _dimensions.DAY_SIZE,
  height: _dimensions.DAY_SIZE,
  padding: 0,
  margin: `0 ${_dimensions.DAY_MARGIN}px`,
  color: (theme.vars || theme).palette.text.disabled,
  fontSize: '0.75rem',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'inline-flex'
}));
const PickersCalendarLoadingContainer = (0, _styles.styled)('div', {
  name: 'MuiDayCalendar',
  slot: 'LoadingContainer'
})({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: weeksContainerHeight
});
const PickersCalendarSlideTransition = (0, _styles.styled)(_PickersSlideTransition.PickersSlideTransition, {
  name: 'MuiDayCalendar',
  slot: 'SlideTransition'
})({
  minHeight: weeksContainerHeight
});
const PickersCalendarWeekContainer = (0, _styles.styled)('div', {
  name: 'MuiDayCalendar',
  slot: 'MonthContainer'
})({
  overflow: 'hidden'
});
const PickersCalendarWeek = (0, _styles.styled)('div', {
  name: 'MuiDayCalendar',
  slot: 'WeekContainer'
})({
  margin: `${_dimensions.DAY_MARGIN}px 0`,
  display: 'flex',
  justifyContent: 'center'
});
function WrappedDay(_ref) {
  let {
      parentProps,
      day,
      focusedDay,
      selectedDays,
      isDateDisabled,
      currentMonthNumber,
      isViewFocused
    } = _ref,
    other = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);
  const {
    disabled,
    disableHighlightToday,
    isMonthSwitchingAnimating,
    showDaysOutsideCurrentMonth,
    slots,
    slotProps,
    timezone
  } = parentProps;
  const adapter = (0, _hooks.usePickerAdapter)();
  const now = (0, _useUtils.useNow)(timezone);
  const isFocusableDay = focusedDay != null && adapter.isSameDay(day, focusedDay);
  const isFocusedDay = isViewFocused && isFocusableDay;
  const isSelected = selectedDays.some(selectedDay => adapter.isSameDay(selectedDay, day));
  const isToday = adapter.isSameDay(day, now);
  const isDisabled = React.useMemo(() => disabled || isDateDisabled(day), [disabled, isDateDisabled, day]);
  const isOutsideCurrentMonth = React.useMemo(() => adapter.getMonth(day) !== currentMonthNumber, [adapter, day, currentMonthNumber]);
  const ownerState = (0, _usePickerDayOwnerState.usePickerDayOwnerState)({
    day,
    selected: isSelected,
    disabled: isDisabled,
    today: isToday,
    outsideCurrentMonth: isOutsideCurrentMonth,
    disableMargin: undefined,
    // This prop can only be defined using slotProps.day so the ownerState for useSlotProps cannot have its value.
    disableHighlightToday,
    showDaysOutsideCurrentMonth
  });
  const Day = slots?.day ?? _PickersDay.PickersDay;
  // We don't want to pass to ownerState down, to avoid re-rendering all the day whenever a prop changes.
  const _useSlotProps = (0, _useSlotProps2.default)({
      elementType: Day,
      externalSlotProps: slotProps?.day,
      additionalProps: (0, _extends2.default)({
        disableHighlightToday,
        showDaysOutsideCurrentMonth,
        role: 'gridcell',
        isAnimating: isMonthSwitchingAnimating,
        // it is used in date range dragging logic by accessing `dataset.timestamp`
        'data-timestamp': adapter.toJsDate(day).valueOf()
      }, other),
      ownerState: (0, _extends2.default)({}, ownerState, {
        day,
        isDayDisabled: isDisabled,
        isDaySelected: isSelected
      })
    }),
    dayProps = (0, _objectWithoutPropertiesLoose2.default)(_useSlotProps, _excluded2);
  const isFirstVisibleCell = React.useMemo(() => {
    const startOfMonth = adapter.startOfMonth(adapter.setMonth(day, currentMonthNumber));
    if (!showDaysOutsideCurrentMonth) {
      return adapter.isSameDay(day, startOfMonth);
    }
    return adapter.isSameDay(day, adapter.startOfWeek(startOfMonth));
  }, [currentMonthNumber, day, showDaysOutsideCurrentMonth, adapter]);
  const isLastVisibleCell = React.useMemo(() => {
    const endOfMonth = adapter.endOfMonth(adapter.setMonth(day, currentMonthNumber));
    if (!showDaysOutsideCurrentMonth) {
      return adapter.isSameDay(day, endOfMonth);
    }
    return adapter.isSameDay(day, adapter.endOfWeek(endOfMonth));
  }, [currentMonthNumber, day, showDaysOutsideCurrentMonth, adapter]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Day, (0, _extends2.default)({}, dayProps, {
    day: day,
    disabled: isDisabled,
    autoFocus: !isOutsideCurrentMonth && isFocusedDay,
    today: isToday,
    outsideCurrentMonth: isOutsideCurrentMonth,
    isFirstVisibleCell: isFirstVisibleCell,
    isLastVisibleCell: isLastVisibleCell,
    selected: isSelected,
    tabIndex: isFocusableDay ? 0 : -1,
    "aria-selected": isSelected,
    "aria-current": isToday ? 'date' : undefined
  }));
}

/**
 * @ignore - do not document.
 */
function DayCalendar(inProps) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiDayCalendar'
  });
  const adapter = (0, _hooks.usePickerAdapter)();
  const {
    onFocusedDayChange,
    className,
    classes: classesProp,
    currentMonth,
    selectedDays,
    focusedDay,
    loading,
    onSelectedDaysChange,
    onMonthSwitchingAnimationEnd,
    readOnly,
    reduceAnimations,
    renderLoading = () => /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      children: "..."
    }),
    slideDirection,
    TransitionProps,
    disablePast,
    disableFuture,
    minDate,
    maxDate,
    shouldDisableDate,
    shouldDisableMonth,
    shouldDisableYear,
    dayOfWeekFormatter = date => adapter.format(date, 'weekdayShort').charAt(0).toUpperCase(),
    hasFocus,
    onFocusedViewChange,
    gridLabelId,
    displayWeekNumber,
    fixedWeekNumber,
    timezone
  } = props;
  const now = (0, _useUtils.useNow)(timezone);
  const classes = useUtilityClasses(classesProp);
  const isRtl = (0, _RtlProvider.useRtl)();
  const isDateDisabled = (0, _useIsDateDisabled.useIsDateDisabled)({
    shouldDisableDate,
    shouldDisableMonth,
    shouldDisableYear,
    minDate,
    maxDate,
    disablePast,
    disableFuture,
    timezone
  });
  const translations = (0, _hooks.usePickerTranslations)();
  const handleDaySelect = (0, _useEventCallback.default)(day => {
    if (readOnly) {
      return;
    }
    onSelectedDaysChange(day);
  });
  const focusDay = day => {
    if (!isDateDisabled(day)) {
      onFocusedDayChange(day);
      onFocusedViewChange?.(true);
    }
  };
  const handleKeyDown = (0, _useEventCallback.default)((event, day) => {
    switch (event.key) {
      case 'ArrowUp':
        focusDay(adapter.addDays(day, -7));
        event.preventDefault();
        break;
      case 'ArrowDown':
        focusDay(adapter.addDays(day, 7));
        event.preventDefault();
        break;
      case 'ArrowLeft':
        {
          const newFocusedDayDefault = adapter.addDays(day, isRtl ? 1 : -1);
          const nextAvailableMonth = adapter.addMonths(day, isRtl ? 1 : -1);
          const closestDayToFocus = (0, _dateUtils.findClosestEnabledDate)({
            adapter,
            date: newFocusedDayDefault,
            minDate: isRtl ? newFocusedDayDefault : adapter.startOfMonth(nextAvailableMonth),
            maxDate: isRtl ? adapter.endOfMonth(nextAvailableMonth) : newFocusedDayDefault,
            isDateDisabled,
            timezone
          });
          focusDay(closestDayToFocus || newFocusedDayDefault);
          event.preventDefault();
          break;
        }
      case 'ArrowRight':
        {
          const newFocusedDayDefault = adapter.addDays(day, isRtl ? -1 : 1);
          const nextAvailableMonth = adapter.addMonths(day, isRtl ? -1 : 1);
          const closestDayToFocus = (0, _dateUtils.findClosestEnabledDate)({
            adapter,
            date: newFocusedDayDefault,
            minDate: isRtl ? adapter.startOfMonth(nextAvailableMonth) : newFocusedDayDefault,
            maxDate: isRtl ? newFocusedDayDefault : adapter.endOfMonth(nextAvailableMonth),
            isDateDisabled,
            timezone
          });
          focusDay(closestDayToFocus || newFocusedDayDefault);
          event.preventDefault();
          break;
        }
      case 'Home':
        focusDay(adapter.startOfWeek(day));
        event.preventDefault();
        break;
      case 'End':
        focusDay(adapter.endOfWeek(day));
        event.preventDefault();
        break;
      case 'PageUp':
        focusDay(adapter.addMonths(day, 1));
        event.preventDefault();
        break;
      case 'PageDown':
        focusDay(adapter.addMonths(day, -1));
        event.preventDefault();
        break;
      default:
        break;
    }
  });
  const handleFocus = (0, _useEventCallback.default)((event, day) => focusDay(day));
  const handleBlur = (0, _useEventCallback.default)((event, day) => {
    if (focusedDay != null && adapter.isSameDay(focusedDay, day)) {
      onFocusedViewChange?.(false);
    }
  });
  const currentMonthNumber = adapter.getMonth(currentMonth);
  const currentYearNumber = adapter.getYear(currentMonth);
  const validSelectedDays = React.useMemo(() => selectedDays.filter(day => !!day).map(day => adapter.startOfDay(day)), [adapter, selectedDays]);

  // need a new ref whenever the `key` of the transition changes: https://reactcommunity.org/react-transition-group/transition/#Transition-prop-nodeRef.
  const transitionKey = `${currentYearNumber}-${currentMonthNumber}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const slideNodeRef = React.useMemo(() => /*#__PURE__*/React.createRef(), [transitionKey]);
  const weeksToDisplay = React.useMemo(() => {
    const toDisplay = adapter.getWeekArray(currentMonth);
    let nextMonth = adapter.addMonths(currentMonth, 1);
    while (fixedWeekNumber && toDisplay.length < fixedWeekNumber) {
      const additionalWeeks = adapter.getWeekArray(nextMonth);
      const hasCommonWeek = adapter.isSameDay(toDisplay[toDisplay.length - 1][0], additionalWeeks[0][0]);
      additionalWeeks.slice(hasCommonWeek ? 1 : 0).forEach(week => {
        if (toDisplay.length < fixedWeekNumber) {
          toDisplay.push(week);
        }
      });
      nextMonth = adapter.addMonths(nextMonth, 1);
    }
    return toDisplay;
  }, [currentMonth, fixedWeekNumber, adapter]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(PickersCalendarDayRoot, {
    role: "grid",
    "aria-labelledby": gridLabelId,
    className: classes.root,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(PickersCalendarDayHeader, {
      role: "row",
      className: classes.header,
      children: [displayWeekNumber && /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersCalendarWeekNumberLabel, {
        variant: "caption",
        role: "columnheader",
        "aria-label": translations.calendarWeekNumberHeaderLabel,
        className: classes.weekNumberLabel,
        children: translations.calendarWeekNumberHeaderText
      }), (0, _dateUtils.getWeekdays)(adapter, now).map((weekday, i) => /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersCalendarWeekDayLabel, {
        variant: "caption",
        role: "columnheader",
        "aria-label": adapter.format(weekday, 'weekday'),
        className: classes.weekDayLabel,
        children: dayOfWeekFormatter(weekday)
      }, i.toString()))]
    }), loading ? /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersCalendarLoadingContainer, {
      className: classes.loadingContainer,
      children: renderLoading()
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersCalendarSlideTransition, (0, _extends2.default)({
      transKey: transitionKey,
      onExited: onMonthSwitchingAnimationEnd,
      reduceAnimations: reduceAnimations,
      slideDirection: slideDirection,
      className: (0, _clsx.default)(className, classes.slideTransition)
    }, TransitionProps, {
      nodeRef: slideNodeRef,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersCalendarWeekContainer, {
        ref: slideNodeRef,
        role: "rowgroup",
        className: classes.monthContainer,
        children: weeksToDisplay.map((week, index) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(PickersCalendarWeek, {
          role: "row",
          className: classes.weekContainer
          // fix issue of announcing row 1 as row 2
          // caused by week day labels row
          ,
          "aria-rowindex": index + 1,
          children: [displayWeekNumber && /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersCalendarWeekNumber, {
            className: classes.weekNumber,
            role: "rowheader",
            "aria-label": translations.calendarWeekNumberAriaLabelText(adapter.getWeekNumber(week[0])),
            children: translations.calendarWeekNumberText(adapter.getWeekNumber(week[0]))
          }), week.map((day, dayIndex) => /*#__PURE__*/(0, _jsxRuntime.jsx)(WrappedDay, {
            parentProps: props,
            day: day,
            selectedDays: validSelectedDays,
            isViewFocused: hasFocus,
            focusedDay: focusedDay,
            onKeyDown: handleKeyDown,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onDaySelect: handleDaySelect,
            isDateDisabled: isDateDisabled,
            currentMonthNumber: currentMonthNumber
            // fix issue of announcing column 1 as column 2 when `displayWeekNumber` is enabled
            ,
            "aria-colindex": dayIndex + 1
          }, day.toString()))]
        }, `week-${week[0]}`))
      })
    }))]
  });
}
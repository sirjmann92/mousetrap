"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateCalendar = void 0;
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _useSlotProps = _interopRequireDefault(require("@mui/utils/useSlotProps"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _useCalendarState = require("./useCalendarState");
var _PickersFadeTransitionGroup = require("./PickersFadeTransitionGroup");
var _DayCalendar = require("./DayCalendar");
var _MonthCalendar = require("../MonthCalendar");
var _YearCalendar = require("../YearCalendar");
var _useViews = require("../internals/hooks/useViews");
var _PickersCalendarHeader = require("../PickersCalendarHeader");
var _dateUtils = require("../internals/utils/date-utils");
var _PickerViewRoot = require("../internals/components/PickerViewRoot");
var _useReduceAnimations = require("../internals/hooks/useReduceAnimations");
var _dateCalendarClasses = require("./dateCalendarClasses");
var _useControlledValue = require("../internals/hooks/useControlledValue");
var _valueManagers = require("../internals/utils/valueManagers");
var _dimensions = require("../internals/constants/dimensions");
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _useDateManager = require("../managers/useDateManager");
var _usePickerAdapter = require("../hooks/usePickerAdapter");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["autoFocus", "onViewChange", "value", "defaultValue", "referenceDate", "disableFuture", "disablePast", "onChange", "onYearChange", "onMonthChange", "reduceAnimations", "shouldDisableDate", "shouldDisableMonth", "shouldDisableYear", "view", "views", "openTo", "className", "classes", "disabled", "readOnly", "minDate", "maxDate", "disableHighlightToday", "focusedView", "onFocusedViewChange", "showDaysOutsideCurrentMonth", "fixedWeekNumber", "dayOfWeekFormatter", "slots", "slotProps", "loading", "renderLoading", "displayWeekNumber", "yearsOrder", "yearsPerRow", "monthsPerRow", "timezone"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    viewTransitionContainer: ['viewTransitionContainer']
  };
  return (0, _composeClasses.default)(slots, _dateCalendarClasses.getDateCalendarUtilityClass, classes);
};
function useDateCalendarDefaultizedProps(props, name) {
  const themeProps = (0, _styles.useThemeProps)({
    props,
    name
  });
  const reduceAnimations = (0, _useReduceAnimations.useReduceAnimations)(themeProps.reduceAnimations);
  const validationProps = (0, _useDateManager.useApplyDefaultValuesToDateValidationProps)(themeProps);
  return (0, _extends2.default)({}, themeProps, validationProps, {
    loading: themeProps.loading ?? false,
    openTo: themeProps.openTo ?? 'day',
    views: themeProps.views ?? ['year', 'day'],
    reduceAnimations,
    renderLoading: themeProps.renderLoading ?? (() => /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      children: "..."
    }))
  });
}
const DateCalendarRoot = (0, _styles.styled)(_PickerViewRoot.PickerViewRoot, {
  name: 'MuiDateCalendar',
  slot: 'Root'
})({
  display: 'flex',
  flexDirection: 'column',
  height: _dimensions.VIEW_HEIGHT
});
const DateCalendarViewTransitionContainer = (0, _styles.styled)(_PickersFadeTransitionGroup.PickersFadeTransitionGroup, {
  name: 'MuiDateCalendar',
  slot: 'ViewTransitionContainer'
})({});
/**
 * Demos:
 *
 * - [DatePicker](https://mui.com/x/react-date-pickers/date-picker/)
 * - [DateCalendar](https://mui.com/x/react-date-pickers/date-calendar/)
 * - [Validation](https://mui.com/x/react-date-pickers/validation/)
 *
 * API:
 *
 * - [DateCalendar API](https://mui.com/x/api/date-pickers/date-calendar/)
 */
const DateCalendar = exports.DateCalendar = /*#__PURE__*/React.forwardRef(function DateCalendar(inProps, ref) {
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const {
    ownerState
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const id = (0, _useId.default)();
  const props = useDateCalendarDefaultizedProps(inProps, 'MuiDateCalendar');
  const {
      autoFocus,
      onViewChange,
      value: valueProp,
      defaultValue,
      referenceDate: referenceDateProp,
      disableFuture,
      disablePast,
      onChange,
      onMonthChange,
      reduceAnimations,
      shouldDisableDate,
      shouldDisableMonth,
      shouldDisableYear,
      view: inView,
      views,
      openTo,
      className,
      classes: classesProp,
      disabled,
      readOnly,
      minDate,
      maxDate,
      disableHighlightToday,
      focusedView: focusedViewProp,
      onFocusedViewChange,
      showDaysOutsideCurrentMonth,
      fixedWeekNumber,
      dayOfWeekFormatter,
      slots,
      slotProps,
      loading,
      renderLoading,
      displayWeekNumber,
      yearsOrder,
      yearsPerRow,
      monthsPerRow,
      timezone: timezoneProp
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const {
    value,
    handleValueChange,
    timezone
  } = (0, _useControlledValue.useControlledValue)({
    name: 'DateCalendar',
    timezone: timezoneProp,
    value: valueProp,
    defaultValue,
    referenceDate: referenceDateProp,
    onChange,
    valueManager: _valueManagers.singleItemValueManager
  });
  const {
    view,
    setView,
    focusedView,
    setFocusedView,
    goToNextView,
    setValueAndGoToNextView
  } = (0, _useViews.useViews)({
    view: inView,
    views,
    openTo,
    onChange: handleValueChange,
    onViewChange,
    autoFocus,
    focusedView: focusedViewProp,
    onFocusedViewChange
  });
  const {
    referenceDate,
    calendarState,
    setVisibleDate,
    isDateDisabled,
    onMonthSwitchingAnimationEnd
  } = (0, _useCalendarState.useCalendarState)({
    value,
    referenceDate: referenceDateProp,
    reduceAnimations,
    onMonthChange,
    minDate,
    maxDate,
    shouldDisableDate,
    disablePast,
    disableFuture,
    timezone,
    getCurrentMonthFromVisibleDate: (visibleDate, prevMonth) => {
      if (adapter.isSameMonth(visibleDate, prevMonth)) {
        return prevMonth;
      }
      return adapter.startOfMonth(visibleDate);
    }
  });

  // When disabled, limit the view to the selected date
  const minDateWithDisabled = disabled && value || minDate;
  const maxDateWithDisabled = disabled && value || maxDate;
  const gridLabelId = `${id}-grid-label`;
  const hasFocus = focusedView !== null;
  const CalendarHeader = slots?.calendarHeader ?? _PickersCalendarHeader.PickersCalendarHeader;
  const calendarHeaderProps = (0, _useSlotProps.default)({
    elementType: CalendarHeader,
    externalSlotProps: slotProps?.calendarHeader,
    additionalProps: {
      views,
      view,
      currentMonth: calendarState.currentMonth,
      onViewChange: setView,
      onMonthChange: month => setVisibleDate({
        target: month,
        reason: 'header-navigation'
      }),
      minDate: minDateWithDisabled,
      maxDate: maxDateWithDisabled,
      disabled,
      disablePast,
      disableFuture,
      reduceAnimations,
      timezone,
      labelId: gridLabelId
    },
    ownerState
  });
  const handleDateMonthChange = (0, _useEventCallback.default)(newDate => {
    const startOfMonth = adapter.startOfMonth(newDate);
    const endOfMonth = adapter.endOfMonth(newDate);
    const closestEnabledDate = isDateDisabled(newDate) ? (0, _dateUtils.findClosestEnabledDate)({
      adapter,
      date: newDate,
      minDate: adapter.isBefore(minDate, startOfMonth) ? startOfMonth : minDate,
      maxDate: adapter.isAfter(maxDate, endOfMonth) ? endOfMonth : maxDate,
      disablePast,
      disableFuture,
      isDateDisabled,
      timezone
    }) : newDate;
    if (closestEnabledDate) {
      setValueAndGoToNextView(closestEnabledDate, 'finish');
      setVisibleDate({
        target: closestEnabledDate,
        reason: 'cell-interaction'
      });
    } else {
      goToNextView();
      setVisibleDate({
        target: startOfMonth,
        reason: 'cell-interaction'
      });
    }
  });
  const handleDateYearChange = (0, _useEventCallback.default)(newDate => {
    const startOfYear = adapter.startOfYear(newDate);
    const endOfYear = adapter.endOfYear(newDate);
    const closestEnabledDate = isDateDisabled(newDate) ? (0, _dateUtils.findClosestEnabledDate)({
      adapter,
      date: newDate,
      minDate: adapter.isBefore(minDate, startOfYear) ? startOfYear : minDate,
      maxDate: adapter.isAfter(maxDate, endOfYear) ? endOfYear : maxDate,
      disablePast,
      disableFuture,
      isDateDisabled,
      timezone
    }) : newDate;
    if (closestEnabledDate) {
      setValueAndGoToNextView(closestEnabledDate, 'finish');
      setVisibleDate({
        target: closestEnabledDate,
        reason: 'cell-interaction'
      });
    } else {
      goToNextView();
      setVisibleDate({
        target: startOfYear,
        reason: 'cell-interaction'
      });
    }
  });
  const handleSelectedDayChange = (0, _useEventCallback.default)(day => {
    if (day) {
      // If there is a date already selected, then we want to keep its time
      return handleValueChange((0, _dateUtils.mergeDateAndTime)(adapter, day, value ?? referenceDate), 'finish', view);
    }
    return handleValueChange(day, 'finish', view);
  });
  React.useEffect(() => {
    if (adapter.isValid(value)) {
      setVisibleDate({
        target: value,
        reason: 'controlled-value-change'
      });
    }
  }, [value]); // eslint-disable-line

  const classes = useUtilityClasses(classesProp);
  const baseDateValidationProps = {
    disablePast,
    disableFuture,
    maxDate,
    minDate
  };
  const commonViewProps = {
    disableHighlightToday,
    readOnly,
    disabled,
    timezone,
    gridLabelId,
    slots,
    slotProps
  };
  const prevOpenViewRef = React.useRef(view);
  React.useEffect(() => {
    // If the view change and the focus was on the previous view
    // Then we update the focus.
    if (prevOpenViewRef.current === view) {
      return;
    }
    if (focusedView === prevOpenViewRef.current) {
      setFocusedView(view, true);
    }
    prevOpenViewRef.current = view;
  }, [focusedView, setFocusedView, view]);
  const selectedDays = React.useMemo(() => [value], [value]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(DateCalendarRoot, (0, _extends2.default)({
    ref: ref,
    className: (0, _clsx.default)(classes.root, className),
    ownerState: ownerState
  }, other, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(CalendarHeader, (0, _extends2.default)({}, calendarHeaderProps, {
      slots: slots,
      slotProps: slotProps
    })), /*#__PURE__*/(0, _jsxRuntime.jsx)(DateCalendarViewTransitionContainer, {
      reduceAnimations: reduceAnimations,
      className: classes.viewTransitionContainer,
      transKey: view,
      ownerState: ownerState,
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        children: [view === 'year' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_YearCalendar.YearCalendar, (0, _extends2.default)({}, baseDateValidationProps, commonViewProps, {
          value: value,
          onChange: handleDateYearChange,
          shouldDisableYear: shouldDisableYear,
          hasFocus: hasFocus,
          onFocusedViewChange: isViewFocused => setFocusedView('year', isViewFocused),
          yearsOrder: yearsOrder,
          yearsPerRow: yearsPerRow,
          referenceDate: referenceDate
        })), view === 'month' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_MonthCalendar.MonthCalendar, (0, _extends2.default)({}, baseDateValidationProps, commonViewProps, {
          hasFocus: hasFocus,
          className: className,
          value: value,
          onChange: handleDateMonthChange,
          shouldDisableMonth: shouldDisableMonth,
          onFocusedViewChange: isViewFocused => setFocusedView('month', isViewFocused),
          monthsPerRow: monthsPerRow,
          referenceDate: referenceDate
        })), view === 'day' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_DayCalendar.DayCalendar, (0, _extends2.default)({}, calendarState, baseDateValidationProps, commonViewProps, {
          onMonthSwitchingAnimationEnd: onMonthSwitchingAnimationEnd,
          hasFocus: hasFocus,
          onFocusedDayChange: focusedDate => setVisibleDate({
            target: focusedDate,
            reason: 'cell-interaction'
          }),
          reduceAnimations: reduceAnimations,
          selectedDays: selectedDays,
          onSelectedDaysChange: handleSelectedDayChange,
          shouldDisableDate: shouldDisableDate,
          shouldDisableMonth: shouldDisableMonth,
          shouldDisableYear: shouldDisableYear,
          onFocusedViewChange: isViewFocused => setFocusedView('day', isViewFocused),
          showDaysOutsideCurrentMonth: showDaysOutsideCurrentMonth,
          fixedWeekNumber: fixedWeekNumber,
          dayOfWeekFormatter: dayOfWeekFormatter,
          displayWeekNumber: displayWeekNumber,
          loading: loading,
          renderLoading: renderLoading
        }))]
      })
    })]
  }));
});
if (process.env.NODE_ENV !== "production") DateCalendar.displayName = "DateCalendar";
process.env.NODE_ENV !== "production" ? DateCalendar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * If `true`, the main element is focused during the first mount.
   * This main element is:
   * - the element chosen by the visible view if any (i.e: the selected day on the `day` view).
   * - the `input` element if there is a field rendered.
   */
  autoFocus: _propTypes.default.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  className: _propTypes.default.string,
  /**
   * Formats the day of week displayed in the calendar header.
   * @param {PickerValidDate} date The date of the day of week provided by the adapter.
   * @returns {string} The name to display.
   * @default (date: PickerValidDate) => adapter.format(date, 'weekdayShort').charAt(0).toUpperCase()
   */
  dayOfWeekFormatter: _propTypes.default.func,
  /**
   * The default selected value.
   * Used when the component is not controlled.
   */
  defaultValue: _propTypes.default.object,
  /**
   * If `true`, the component is disabled.
   * When disabled, the value cannot be changed and no interaction is possible.
   * @default false
   */
  disabled: _propTypes.default.bool,
  /**
   * If `true`, disable values after the current date for date components, time for time components and both for date time components.
   * @default false
   */
  disableFuture: _propTypes.default.bool,
  /**
   * If `true`, today's date is rendering without highlighting with circle.
   * @default false
   */
  disableHighlightToday: _propTypes.default.bool,
  /**
   * If `true`, disable values before the current date for date components, time for time components and both for date time components.
   * @default false
   */
  disablePast: _propTypes.default.bool,
  /**
   * If `true`, the week number will be display in the calendar.
   */
  displayWeekNumber: _propTypes.default.bool,
  /**
   * The day view will show as many weeks as needed after the end of the current month to match this value.
   * Put it to 6 to have a fixed number of weeks in Gregorian calendars
   */
  fixedWeekNumber: _propTypes.default.number,
  /**
   * Controlled focused view.
   */
  focusedView: _propTypes.default.oneOf(['day', 'month', 'year']),
  /**
   * If `true`, calls `renderLoading` instead of rendering the day calendar.
   * Can be used to preload information and show it in calendar.
   * @default false
   */
  loading: _propTypes.default.bool,
  /**
   * Maximal selectable date.
   * @default 2099-12-31
   */
  maxDate: _propTypes.default.object,
  /**
   * Minimal selectable date.
   * @default 1900-01-01
   */
  minDate: _propTypes.default.object,
  /**
   * Months rendered per row.
   * @default 3
   */
  monthsPerRow: _propTypes.default.oneOf([3, 4]),
  /**
   * Callback fired when the value changes.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @template TView The view type. Will be one of date or time views.
   * @param {TValue} value The new value.
   * @param {PickerSelectionState | undefined} selectionState Indicates if the date selection is complete.
   * @param {TView | undefined} selectedView Indicates the view in which the selection has been made.
   */
  onChange: _propTypes.default.func,
  /**
   * Callback fired on focused view change.
   * @template TView Type of the view. It will vary based on the Picker type and the `views` it uses.
   * @param {TView} view The new view to focus or not.
   * @param {boolean} hasFocus `true` if the view should be focused.
   */
  onFocusedViewChange: _propTypes.default.func,
  /**
   * Callback fired on month change.
   * @param {PickerValidDate} month The new month.
   */
  onMonthChange: _propTypes.default.func,
  /**
   * Callback fired on view change.
   * @template TView Type of the view. It will vary based on the Picker type and the `views` it uses.
   * @param {TView} view The new view.
   */
  onViewChange: _propTypes.default.func,
  /**
   * Callback fired on year change.
   * @param {PickerValidDate} year The new year.
   */
  onYearChange: _propTypes.default.func,
  /**
   * The default visible view.
   * Used when the component view is not controlled.
   * Must be a valid option from `views` list.
   */
  openTo: _propTypes.default.oneOf(['day', 'month', 'year']),
  /**
   * If `true`, the component is read-only.
   * When read-only, the value cannot be changed but the user can interact with the interface.
   * @default false
   */
  readOnly: _propTypes.default.bool,
  /**
   * If `true`, disable heavy animations.
   * @default `@media(prefers-reduced-motion: reduce)` || `navigator.userAgent` matches Android <10 or iOS <13
   */
  reduceAnimations: _propTypes.default.bool,
  /**
   * The date used to generate the new value when both `value` and `defaultValue` are empty.
   * @default The closest valid date using the validation props, except callbacks such as `shouldDisableDate`.
   */
  referenceDate: _propTypes.default.object,
  /**
   * Component displaying when passed `loading` true.
   * @returns {React.ReactNode} The node to render when loading.
   * @default () => <span>...</span>
   */
  renderLoading: _propTypes.default.func,
  /**
   * Disable specific date.
   *
   * Warning: This function can be called multiple times (for example when rendering date calendar, checking if focus can be moved to a certain date, etc.). Expensive computations can impact performance.
   *
   * @param {PickerValidDate} day The date to test.
   * @returns {boolean} If `true` the date will be disabled.
   */
  shouldDisableDate: _propTypes.default.func,
  /**
   * Disable specific month.
   * @param {PickerValidDate} month The month to test.
   * @returns {boolean} If `true`, the month will be disabled.
   */
  shouldDisableMonth: _propTypes.default.func,
  /**
   * Disable specific year.
   * @param {PickerValidDate} year The year to test.
   * @returns {boolean} If `true`, the year will be disabled.
   */
  shouldDisableYear: _propTypes.default.func,
  /**
   * If `true`, days outside the current month are rendered:
   *
   * - if `fixedWeekNumber` is defined, renders days to have the weeks requested.
   *
   * - if `fixedWeekNumber` is not defined, renders day to fill the first and last week of the current month.
   *
   * - ignored if `calendars` equals more than `1` on range pickers.
   * @default false
   */
  showDaysOutsideCurrentMonth: _propTypes.default.bool,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: _propTypes.default.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: _propTypes.default.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object]),
  /**
   * Choose which timezone to use for the value.
   * Example: "default", "system", "UTC", "America/New_York".
   * If you pass values from other timezones to some props, they will be converted to this timezone before being used.
   * @see See the {@link https://mui.com/x/react-date-pickers/timezone/ timezones documentation} for more details.
   * @default The timezone of the `value` or `defaultValue` prop is defined, 'default' otherwise.
   */
  timezone: _propTypes.default.string,
  /**
   * The selected value.
   * Used when the component is controlled.
   */
  value: _propTypes.default.object,
  /**
   * The visible view.
   * Used when the component view is controlled.
   * Must be a valid option from `views` list.
   */
  view: _propTypes.default.oneOf(['day', 'month', 'year']),
  /**
   * Available views.
   */
  views: _propTypes.default.arrayOf(_propTypes.default.oneOf(['day', 'month', 'year']).isRequired),
  /**
   * Years are displayed in ascending (chronological) order by default.
   * If `desc`, years are displayed in descending order.
   * @default 'asc'
   */
  yearsOrder: _propTypes.default.oneOf(['asc', 'desc']),
  /**
   * Years rendered per row.
   * @default 3
   */
  yearsPerRow: _propTypes.default.oneOf([3, 4])
} : void 0;
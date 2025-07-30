"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StaticDateTimePicker = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _shared = require("../DateTimePicker/shared");
var _timeViewRenderers = require("../timeViewRenderers");
var _dateViewRenderers = require("../dateViewRenderers");
var _valueManagers = require("../internals/utils/valueManagers");
var _useStaticPicker = require("../internals/hooks/useStaticPicker");
var _validation = require("../validation");
var _utils = require("../internals/utils/utils");
var _MultiSectionDigitalClock = require("../MultiSectionDigitalClock");
var _dimensions = require("../internals/constants/dimensions");
var _DigitalClock = require("../DigitalClock");
var _dateUtils = require("../internals/utils/date-utils");
var _timeUtils = require("../internals/utils/time-utils");
const STEPS = [{
  views: _dateUtils.DATE_VIEWS
}, {
  views: _timeUtils.EXPORTED_TIME_VIEWS
}];
/**
 * Demos:
 *
 * - [DateTimePicker](https://mui.com/x/react-date-pickers/date-time-picker/)
 * - [Validation](https://mui.com/x/react-date-pickers/validation/)
 *
 * API:
 *
 * - [StaticDateTimePicker API](https://mui.com/x/api/date-pickers/static-date-time-picker/)
 */
const StaticDateTimePicker = exports.StaticDateTimePicker = /*#__PURE__*/React.forwardRef(function StaticDateTimePicker(inProps, ref) {
  const defaultizedProps = (0, _shared.useDateTimePickerDefaultizedProps)(inProps, 'MuiStaticDateTimePicker');
  const displayStaticWrapperAs = defaultizedProps.displayStaticWrapperAs ?? 'mobile';
  const ampmInClock = defaultizedProps.ampmInClock ?? displayStaticWrapperAs === 'desktop';
  const renderTimeView = defaultizedProps.shouldRenderTimeInASingleColumn ? _timeViewRenderers.renderDigitalClockTimeView : _timeViewRenderers.renderMultiSectionDigitalClockTimeView;
  const viewRenderers = (0, _extends2.default)({
    day: _dateViewRenderers.renderDateViewCalendar,
    month: _dateViewRenderers.renderDateViewCalendar,
    year: _dateViewRenderers.renderDateViewCalendar,
    hours: renderTimeView,
    minutes: renderTimeView,
    seconds: renderTimeView,
    meridiem: renderTimeView
  }, defaultizedProps.viewRenderers);

  // Need to avoid adding the `meridiem` view when unexpected renderer is specified
  const shouldHoursRendererContainMeridiemView = viewRenderers.hours?.name === _timeViewRenderers.renderMultiSectionDigitalClockTimeView.name;
  const views = !shouldHoursRendererContainMeridiemView ? defaultizedProps.views.filter(view => view !== 'meridiem') : defaultizedProps.views;

  // Props with the default values specific to the static variant
  const props = (0, _extends2.default)({}, defaultizedProps, {
    viewRenderers,
    displayStaticWrapperAs,
    views,
    ampmInClock,
    yearsPerRow: defaultizedProps.yearsPerRow ?? (displayStaticWrapperAs === 'mobile' ? 3 : 4),
    slotProps: (0, _extends2.default)({}, defaultizedProps.slotProps, {
      tabs: (0, _extends2.default)({
        hidden: displayStaticWrapperAs === 'desktop'
      }, defaultizedProps.slotProps?.tabs),
      toolbar: (0, _extends2.default)({
        hidden: displayStaticWrapperAs === 'desktop',
        ampmInClock
      }, defaultizedProps.slotProps?.toolbar)
    }),
    sx: (0, _utils.mergeSx)([{
      [`& .${_MultiSectionDigitalClock.multiSectionDigitalClockClasses.root}`]: {
        width: _dimensions.DIALOG_WIDTH
      },
      [`& .${_MultiSectionDigitalClock.multiSectionDigitalClockSectionClasses.root}`]: {
        flex: 1,
        // account for the border on `MultiSectionDigitalClock`
        maxHeight: _dimensions.VIEW_HEIGHT - 1,
        [`.${_MultiSectionDigitalClock.multiSectionDigitalClockSectionClasses.item}`]: {
          width: 'auto'
        }
      },
      [`& .${_DigitalClock.digitalClockClasses.root}`]: {
        width: _dimensions.DIALOG_WIDTH,
        maxHeight: _dimensions.VIEW_HEIGHT,
        flex: 1,
        [`.${_DigitalClock.digitalClockClasses.item}`]: {
          justifyContent: 'center'
        }
      }
    }], defaultizedProps?.sx)
  });
  const {
    renderPicker
  } = (0, _useStaticPicker.useStaticPicker)({
    ref,
    props,
    valueManager: _valueManagers.singleItemValueManager,
    valueType: 'date-time',
    validator: _validation.validateDateTime,
    steps: STEPS
  });
  return renderPicker();
});
if (process.env.NODE_ENV !== "production") StaticDateTimePicker.displayName = "StaticDateTimePicker";
StaticDateTimePicker.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * 12h/24h view for hour selection clock.
   * @default adapter.is12HourCycleInCurrentLocale()
   */
  ampm: _propTypes.default.bool,
  /**
   * Display ampm controls under the clock (instead of in the toolbar).
   * @default true on desktop, false on mobile
   */
  ampmInClock: _propTypes.default.bool,
  /**
   * If `true`, the main element is focused during the first mount.
   * This main element is:
   * - the element chosen by the visible view if any (i.e: the selected day on the `day` view).
   * - the `input` element if there is a field rendered.
   */
  autoFocus: _propTypes.default.bool,
  className: _propTypes.default.string,
  /**
   * Formats the day of week displayed in the calendar header.
   * @param {PickerValidDate} date The date of the day of week provided by the adapter.
   * @returns {string} The name to display.
   * @default (date: PickerValidDate) => adapter.format(date, 'weekdayShort').charAt(0).toUpperCase()
   */
  dayOfWeekFormatter: _propTypes.default.func,
  /**
   * The default value.
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
   * Do not ignore date part when validating min/max time.
   * @default false
   */
  disableIgnoringDatePartForTimeValidation: _propTypes.default.bool,
  /**
   * If `true`, disable values before the current date for date components, time for time components and both for date time components.
   * @default false
   */
  disablePast: _propTypes.default.bool,
  /**
   * Force static wrapper inner components to be rendered in mobile or desktop mode.
   * @default "mobile"
   */
  displayStaticWrapperAs: _propTypes.default.oneOf(['desktop', 'mobile']),
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
   * If `true`, calls `renderLoading` instead of rendering the day calendar.
   * Can be used to preload information and show it in calendar.
   * @default false
   */
  loading: _propTypes.default.bool,
  /**
   * Locale for components texts.
   * Allows overriding texts coming from `LocalizationProvider` and `theme`.
   */
  localeText: _propTypes.default.object,
  /**
   * Maximal selectable date.
   * @default 2099-12-31
   */
  maxDate: _propTypes.default.object,
  /**
   * Maximal selectable moment of time with binding to date, to set max time in each day use `maxTime`.
   */
  maxDateTime: _propTypes.default.object,
  /**
   * Maximal selectable time.
   * The date part of the object will be ignored unless `props.disableIgnoringDatePartForTimeValidation === true`.
   */
  maxTime: _propTypes.default.object,
  /**
   * Minimal selectable date.
   * @default 1900-01-01
   */
  minDate: _propTypes.default.object,
  /**
   * Minimal selectable moment of time with binding to date, to set min time in each day use `minTime`.
   */
  minDateTime: _propTypes.default.object,
  /**
   * Minimal selectable time.
   * The date part of the object will be ignored unless `props.disableIgnoringDatePartForTimeValidation === true`.
   */
  minTime: _propTypes.default.object,
  /**
   * Step over minutes.
   * @default 1
   */
  minutesStep: _propTypes.default.number,
  /**
   * Months rendered per row.
   * @default 3
   */
  monthsPerRow: _propTypes.default.oneOf([3, 4]),
  /**
   * Callback fired when the value is accepted.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @template TError The validation error type. It will be either `string` or a `null`. It can be in `[start, end]` format in case of range value.
   * @param {TValue} value The value that was just accepted.
   * @param {FieldChangeHandlerContext<TError>} context The context containing the validation result of the current value.
   */
  onAccept: _propTypes.default.func,
  /**
   * Callback fired when the value changes.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @template TError The validation error type. It will be either `string` or a `null`. It can be in `[start, end]` format in case of range value.
   * @param {TValue} value The new value.
   * @param {FieldChangeHandlerContext<TError>} context The context containing the validation result of the current value.
   */
  onChange: _propTypes.default.func,
  /**
   * Callback fired when component requests to be closed.
   * Can be fired when selecting (by default on `desktop` mode) or clearing a value.
   * @deprecated Please avoid using as it will be removed in next major version.
   */
  onClose: _propTypes.default.func,
  /**
   * Callback fired when the error associated with the current value changes.
   * When a validation error is detected, the `error` parameter contains a non-null value.
   * This can be used to render an appropriate form error.
   * @template TError The validation error type. It will be either `string` or a `null`. It can be in `[start, end]` format in case of range value.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @param {TError} error The reason why the current value is not valid.
   * @param {TValue} value The value associated with the error.
   */
  onError: _propTypes.default.func,
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
  openTo: _propTypes.default.oneOf(['day', 'hours', 'meridiem', 'minutes', 'month', 'seconds', 'year']),
  /**
   * Force rendering in particular orientation.
   */
  orientation: _propTypes.default.oneOf(['landscape', 'portrait']),
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
   * @default The closest valid date-time using the validation props, except callbacks like `shouldDisable<...>`.
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
   * Disable specific time.
   * @param {PickerValidDate} value The value to check.
   * @param {TimeView} view The clock type of the timeValue.
   * @returns {boolean} If `true` the time will be disabled.
   */
  shouldDisableTime: _propTypes.default.func,
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
   * If `true`, disabled digital clock items will not be rendered.
   * @default false
   */
  skipDisabled: _propTypes.default.bool,
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
   * Amount of time options below or at which the single column time renderer is used.
   * @default 24
   */
  thresholdToRenderTimeInASingleColumn: _propTypes.default.number,
  /**
   * The time steps between two time unit options.
   * For example, if `timeSteps.minutes = 8`, then the available minute options will be `[0, 8, 16, 24, 32, 40, 48, 56]`.
   * When single column time renderer is used, only `timeSteps.minutes` will be used.
   * @default{ hours: 1, minutes: 5, seconds: 5 }
   */
  timeSteps: _propTypes.default.shape({
    hours: _propTypes.default.number,
    minutes: _propTypes.default.number,
    seconds: _propTypes.default.number
  }),
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
  view: _propTypes.default.oneOf(['day', 'hours', 'meridiem', 'minutes', 'month', 'seconds', 'year']),
  /**
   * Define custom view renderers for each section.
   * If `null`, the section will only have field editing.
   * If `undefined`, internally defined view will be used.
   */
  viewRenderers: _propTypes.default.shape({
    day: _propTypes.default.func,
    hours: _propTypes.default.func,
    meridiem: _propTypes.default.func,
    minutes: _propTypes.default.func,
    month: _propTypes.default.func,
    seconds: _propTypes.default.func,
    year: _propTypes.default.func
  }),
  /**
   * Available views.
   */
  views: _propTypes.default.arrayOf(_propTypes.default.oneOf(['day', 'hours', 'minutes', 'month', 'seconds', 'year']).isRequired),
  /**
   * Years are displayed in ascending (chronological) order by default.
   * If `desc`, years are displayed in descending order.
   * @default 'asc'
   */
  yearsOrder: _propTypes.default.oneOf(['asc', 'desc']),
  /**
   * Years rendered per row.
   * @default `4` when `displayStaticWrapperAs === 'desktop'`, `3` otherwise.
   */
  yearsPerRow: _propTypes.default.oneOf([3, 4])
};
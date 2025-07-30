"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.YearCalendar = void 0;
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _createStyled = require("@mui/system/createStyled");
var _styles = require("@mui/material/styles");
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useControlled = _interopRequireDefault(require("@mui/utils/useControlled"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _YearCalendarButton = require("./YearCalendarButton");
var _useUtils = require("../internals/hooks/useUtils");
var _yearCalendarClasses = require("./yearCalendarClasses");
var _valueManagers = require("../internals/utils/valueManagers");
var _getDefaultReferenceDate = require("../internals/utils/getDefaultReferenceDate");
var _useControlledValue = require("../internals/hooks/useControlledValue");
var _dimensions = require("../internals/constants/dimensions");
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _useDateManager = require("../managers/useDateManager");
var _usePickerAdapter = require("../hooks/usePickerAdapter");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["autoFocus", "className", "classes", "value", "defaultValue", "referenceDate", "disabled", "disableFuture", "disablePast", "maxDate", "minDate", "onChange", "readOnly", "shouldDisableYear", "disableHighlightToday", "onYearFocus", "hasFocus", "onFocusedViewChange", "yearsOrder", "yearsPerRow", "timezone", "gridLabelId", "slots", "slotProps"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root']
  };
  return (0, _composeClasses.default)(slots, _yearCalendarClasses.getYearCalendarUtilityClass, classes);
};
function useYearCalendarDefaultizedProps(props, name) {
  const themeProps = (0, _styles.useThemeProps)({
    props,
    name
  });
  const validationProps = (0, _useDateManager.useApplyDefaultValuesToDateValidationProps)(themeProps);
  return (0, _extends2.default)({}, themeProps, validationProps, {
    yearsPerRow: themeProps.yearsPerRow ?? 3,
    yearsOrder: themeProps.yearsOrder ?? 'asc'
  });
}
const YearCalendarRoot = (0, _styles.styled)('div', {
  name: 'MuiYearCalendar',
  slot: 'Root',
  shouldForwardProp: prop => (0, _createStyled.shouldForwardProp)(prop) && prop !== 'yearsPerRow'
})({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  rowGap: 12,
  padding: '6px 0',
  overflowY: 'auto',
  height: '100%',
  width: _dimensions.DIALOG_WIDTH,
  maxHeight: _dimensions.MAX_CALENDAR_HEIGHT,
  // avoid padding increasing width over defined
  boxSizing: 'border-box',
  position: 'relative',
  variants: [{
    props: {
      yearsPerRow: 3
    },
    style: {
      columnGap: 24
    }
  }, {
    props: {
      yearsPerRow: 4
    },
    style: {
      columnGap: 0,
      padding: '0 2px'
    }
  }]
});
const YearCalendarButtonFiller = (0, _styles.styled)('div', {
  name: 'MuiYearCalendar',
  slot: 'ButtonFiller'
})({
  height: 36,
  width: 72
});
/**
 * Demos:
 *
 * - [DateCalendar](https://mui.com/x/react-date-pickers/date-calendar/)
 *
 * API:
 *
 * - [YearCalendar API](https://mui.com/x/api/date-pickers/year-calendar/)
 */
const YearCalendar = exports.YearCalendar = /*#__PURE__*/React.forwardRef(function YearCalendar(inProps, ref) {
  const props = useYearCalendarDefaultizedProps(inProps, 'MuiYearCalendar');
  const {
      autoFocus,
      className,
      classes: classesProp,
      value: valueProp,
      defaultValue,
      referenceDate: referenceDateProp,
      disabled,
      disableFuture,
      disablePast,
      maxDate,
      minDate,
      onChange,
      readOnly,
      shouldDisableYear,
      onYearFocus,
      hasFocus,
      onFocusedViewChange,
      yearsOrder,
      yearsPerRow,
      timezone: timezoneProp,
      gridLabelId,
      slots,
      slotProps
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const {
    value,
    handleValueChange,
    timezone
  } = (0, _useControlledValue.useControlledValue)({
    name: 'YearCalendar',
    timezone: timezoneProp,
    value: valueProp,
    defaultValue,
    referenceDate: referenceDateProp,
    onChange,
    valueManager: _valueManagers.singleItemValueManager
  });
  const now = (0, _useUtils.useNow)(timezone);
  const isRtl = (0, _RtlProvider.useRtl)();
  const adapter = (0, _usePickerAdapter.usePickerAdapter)();
  const {
    ownerState
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const referenceDate = React.useMemo(() => _valueManagers.singleItemValueManager.getInitialReferenceValue({
    value,
    adapter,
    props,
    timezone,
    referenceDate: referenceDateProp,
    granularity: _getDefaultReferenceDate.SECTION_TYPE_GRANULARITY.year
  }), [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const classes = useUtilityClasses(classesProp);
  const todayYear = React.useMemo(() => adapter.getYear(now), [adapter, now]);
  const selectedYear = React.useMemo(() => {
    if (value != null) {
      return adapter.getYear(value);
    }
    return null;
  }, [value, adapter]);
  const [focusedYear, setFocusedYear] = React.useState(() => selectedYear || adapter.getYear(referenceDate));
  const [internalHasFocus, setInternalHasFocus] = (0, _useControlled.default)({
    name: 'YearCalendar',
    state: 'hasFocus',
    controlled: hasFocus,
    default: autoFocus ?? false
  });
  const changeHasFocus = (0, _useEventCallback.default)(newHasFocus => {
    setInternalHasFocus(newHasFocus);
    if (onFocusedViewChange) {
      onFocusedViewChange(newHasFocus);
    }
  });
  const isYearDisabled = React.useCallback(dateToValidate => {
    if (disablePast && adapter.isBeforeYear(dateToValidate, now)) {
      return true;
    }
    if (disableFuture && adapter.isAfterYear(dateToValidate, now)) {
      return true;
    }
    if (minDate && adapter.isBeforeYear(dateToValidate, minDate)) {
      return true;
    }
    if (maxDate && adapter.isAfterYear(dateToValidate, maxDate)) {
      return true;
    }
    if (!shouldDisableYear) {
      return false;
    }
    const yearToValidate = adapter.startOfYear(dateToValidate);
    return shouldDisableYear(yearToValidate);
  }, [disableFuture, disablePast, maxDate, minDate, now, shouldDisableYear, adapter]);
  const handleYearSelection = (0, _useEventCallback.default)((event, year) => {
    if (readOnly) {
      return;
    }
    const newDate = adapter.setYear(value ?? referenceDate, year);
    handleValueChange(newDate);
  });
  const focusYear = (0, _useEventCallback.default)(year => {
    if (!isYearDisabled(adapter.setYear(value ?? referenceDate, year))) {
      setFocusedYear(year);
      changeHasFocus(true);
      onYearFocus?.(year);
    }
  });
  React.useEffect(() => {
    setFocusedYear(prevFocusedYear => selectedYear !== null && prevFocusedYear !== selectedYear ? selectedYear : prevFocusedYear);
  }, [selectedYear]);
  const verticalDirection = yearsOrder !== 'desc' ? yearsPerRow * 1 : yearsPerRow * -1;
  const horizontalDirection = isRtl && yearsOrder === 'asc' || !isRtl && yearsOrder === 'desc' ? -1 : 1;
  const handleKeyDown = (0, _useEventCallback.default)((event, year) => {
    switch (event.key) {
      case 'ArrowUp':
        focusYear(year - verticalDirection);
        event.preventDefault();
        break;
      case 'ArrowDown':
        focusYear(year + verticalDirection);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        focusYear(year - horizontalDirection);
        event.preventDefault();
        break;
      case 'ArrowRight':
        focusYear(year + horizontalDirection);
        event.preventDefault();
        break;
      default:
        break;
    }
  });
  const handleYearFocus = (0, _useEventCallback.default)((event, year) => {
    focusYear(year);
  });
  const handleYearBlur = (0, _useEventCallback.default)((event, year) => {
    if (focusedYear === year) {
      changeHasFocus(false);
    }
  });
  const scrollerRef = React.useRef(null);
  const handleRef = (0, _useForkRef.default)(ref, scrollerRef);
  React.useEffect(() => {
    if (autoFocus || scrollerRef.current === null) {
      return;
    }
    const tabbableButton = scrollerRef.current.querySelector('[tabindex="0"]');
    if (!tabbableButton) {
      return;
    }

    // Taken from useScroll in x-data-grid, but vertically centered
    const offsetHeight = tabbableButton.offsetHeight;
    const offsetTop = tabbableButton.offsetTop;
    const clientHeight = scrollerRef.current.clientHeight;
    const scrollTop = scrollerRef.current.scrollTop;
    const elementBottom = offsetTop + offsetHeight;
    if (offsetHeight > clientHeight || offsetTop < scrollTop) {
      // Button already visible
      return;
    }
    scrollerRef.current.scrollTop = elementBottom - clientHeight / 2 - offsetHeight / 2;
  }, [autoFocus]);
  const yearRange = adapter.getYearRange([minDate, maxDate]);
  if (yearsOrder === 'desc') {
    yearRange.reverse();
  }
  let fillerAmount = yearsPerRow - yearRange.length % yearsPerRow;
  if (fillerAmount === yearsPerRow) {
    fillerAmount = 0;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(YearCalendarRoot, (0, _extends2.default)({
    ref: handleRef,
    className: (0, _clsx.default)(classes.root, className),
    ownerState: ownerState,
    role: "radiogroup",
    "aria-labelledby": gridLabelId,
    yearsPerRow: yearsPerRow
  }, other, {
    children: [yearRange.map(year => {
      const yearNumber = adapter.getYear(year);
      const isSelected = yearNumber === selectedYear;
      const isDisabled = disabled || isYearDisabled(year);
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_YearCalendarButton.YearCalendarButton, {
        selected: isSelected,
        value: yearNumber,
        onClick: handleYearSelection,
        onKeyDown: handleKeyDown,
        autoFocus: internalHasFocus && yearNumber === focusedYear,
        disabled: isDisabled,
        tabIndex: yearNumber === focusedYear && !isDisabled ? 0 : -1,
        onFocus: handleYearFocus,
        onBlur: handleYearBlur,
        "aria-current": todayYear === yearNumber ? 'date' : undefined,
        slots: slots,
        slotProps: slotProps,
        classes: classesProp,
        children: adapter.format(year, 'year')
      }, adapter.format(year, 'year'));
    }), Array.from({
      length: fillerAmount
    }, (_, index) => /*#__PURE__*/(0, _jsxRuntime.jsx)(YearCalendarButtonFiller, {}, index))]
  }));
});
if (process.env.NODE_ENV !== "production") YearCalendar.displayName = "YearCalendar";
process.env.NODE_ENV !== "production" ? YearCalendar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  autoFocus: _propTypes.default.bool,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  className: _propTypes.default.string,
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
  gridLabelId: _propTypes.default.string,
  hasFocus: _propTypes.default.bool,
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
   * Callback fired when the value changes.
   * @param {PickerValidDate} value The new value.
   */
  onChange: _propTypes.default.func,
  onFocusedViewChange: _propTypes.default.func,
  onYearFocus: _propTypes.default.func,
  /**
   * If `true`, the component is read-only.
   * When read-only, the value cannot be changed but the user can interact with the interface.
   * @default false
   */
  readOnly: _propTypes.default.bool,
  /**
   * The date used to generate the new value when both `value` and `defaultValue` are empty.
   * @default The closest valid year using the validation props, except callbacks such as `shouldDisableYear`.
   */
  referenceDate: _propTypes.default.object,
  /**
   * Disable specific year.
   * @param {PickerValidDate} year The year to test.
   * @returns {boolean} If `true`, the year will be disabled.
   */
  shouldDisableYear: _propTypes.default.func,
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
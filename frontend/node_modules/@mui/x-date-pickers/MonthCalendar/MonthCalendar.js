"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MonthCalendar = void 0;
exports.useMonthCalendarDefaultizedProps = useMonthCalendarDefaultizedProps;
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _RtlProvider = require("@mui/system/RtlProvider");
var _createStyled = require("@mui/system/createStyled");
var _styles = require("@mui/material/styles");
var _useControlled = _interopRequireDefault(require("@mui/utils/useControlled"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _MonthCalendarButton = require("./MonthCalendarButton");
var _useUtils = require("../internals/hooks/useUtils");
var _monthCalendarClasses = require("./monthCalendarClasses");
var _dateUtils = require("../internals/utils/date-utils");
var _valueManagers = require("../internals/utils/valueManagers");
var _getDefaultReferenceDate = require("../internals/utils/getDefaultReferenceDate");
var _useControlledValue = require("../internals/hooks/useControlledValue");
var _dimensions = require("../internals/constants/dimensions");
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _useDateManager = require("../managers/useDateManager");
var _usePickerAdapter = require("../hooks/usePickerAdapter");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["autoFocus", "className", "classes", "value", "defaultValue", "referenceDate", "disabled", "disableFuture", "disablePast", "maxDate", "minDate", "onChange", "shouldDisableMonth", "readOnly", "disableHighlightToday", "onMonthFocus", "hasFocus", "onFocusedViewChange", "monthsPerRow", "timezone", "gridLabelId", "slots", "slotProps"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root']
  };
  return (0, _composeClasses.default)(slots, _monthCalendarClasses.getMonthCalendarUtilityClass, classes);
};
function useMonthCalendarDefaultizedProps(props, name) {
  const themeProps = (0, _styles.useThemeProps)({
    props,
    name
  });
  const validationProps = (0, _useDateManager.useApplyDefaultValuesToDateValidationProps)(themeProps);
  return (0, _extends2.default)({}, themeProps, validationProps, {
    monthsPerRow: themeProps.monthsPerRow ?? 3
  });
}
const MonthCalendarRoot = (0, _styles.styled)('div', {
  name: 'MuiMonthCalendar',
  slot: 'Root',
  shouldForwardProp: prop => (0, _createStyled.shouldForwardProp)(prop) && prop !== 'monthsPerRow'
})({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  rowGap: 16,
  padding: '8px 0',
  width: _dimensions.DIALOG_WIDTH,
  // avoid padding increasing width over defined
  boxSizing: 'border-box',
  variants: [{
    props: {
      monthsPerRow: 3
    },
    style: {
      columnGap: 24
    }
  }, {
    props: {
      monthsPerRow: 4
    },
    style: {
      columnGap: 0
    }
  }]
});
/**
 * Demos:
 *
 * - [DateCalendar](https://mui.com/x/react-date-pickers/date-calendar/)
 *
 * API:
 *
 * - [MonthCalendar API](https://mui.com/x/api/date-pickers/month-calendar/)
 */
const MonthCalendar = exports.MonthCalendar = /*#__PURE__*/React.forwardRef(function MonthCalendar(inProps, ref) {
  const props = useMonthCalendarDefaultizedProps(inProps, 'MuiMonthCalendar');
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
      shouldDisableMonth,
      readOnly,
      onMonthFocus,
      hasFocus,
      onFocusedViewChange,
      monthsPerRow,
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
    name: 'MonthCalendar',
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
    granularity: _getDefaultReferenceDate.SECTION_TYPE_GRANULARITY.month
  }), [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const classes = useUtilityClasses(classesProp);
  const todayMonth = React.useMemo(() => adapter.getMonth(now), [adapter, now]);
  const selectedMonth = React.useMemo(() => {
    if (value != null) {
      return adapter.getMonth(value);
    }
    return null;
  }, [value, adapter]);
  const [focusedMonth, setFocusedMonth] = React.useState(() => selectedMonth || adapter.getMonth(referenceDate));
  const [internalHasFocus, setInternalHasFocus] = (0, _useControlled.default)({
    name: 'MonthCalendar',
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
  const isMonthDisabled = React.useCallback(dateToValidate => {
    const firstEnabledMonth = adapter.startOfMonth(disablePast && adapter.isAfter(now, minDate) ? now : minDate);
    const lastEnabledMonth = adapter.startOfMonth(disableFuture && adapter.isBefore(now, maxDate) ? now : maxDate);
    const monthToValidate = adapter.startOfMonth(dateToValidate);
    if (adapter.isBefore(monthToValidate, firstEnabledMonth)) {
      return true;
    }
    if (adapter.isAfter(monthToValidate, lastEnabledMonth)) {
      return true;
    }
    if (!shouldDisableMonth) {
      return false;
    }
    return shouldDisableMonth(monthToValidate);
  }, [disableFuture, disablePast, maxDate, minDate, now, shouldDisableMonth, adapter]);
  const handleMonthSelection = (0, _useEventCallback.default)((event, month) => {
    if (readOnly) {
      return;
    }
    const newDate = adapter.setMonth(value ?? referenceDate, month);
    handleValueChange(newDate);
  });
  const focusMonth = (0, _useEventCallback.default)(month => {
    if (!isMonthDisabled(adapter.setMonth(value ?? referenceDate, month))) {
      setFocusedMonth(month);
      changeHasFocus(true);
      if (onMonthFocus) {
        onMonthFocus(month);
      }
    }
  });
  React.useEffect(() => {
    setFocusedMonth(prevFocusedMonth => selectedMonth !== null && prevFocusedMonth !== selectedMonth ? selectedMonth : prevFocusedMonth);
  }, [selectedMonth]);
  const handleKeyDown = (0, _useEventCallback.default)((event, month) => {
    const monthsInYear = 12;
    const monthsInRow = 3;
    switch (event.key) {
      case 'ArrowUp':
        focusMonth((monthsInYear + month - monthsInRow) % monthsInYear);
        event.preventDefault();
        break;
      case 'ArrowDown':
        focusMonth((monthsInYear + month + monthsInRow) % monthsInYear);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        focusMonth((monthsInYear + month + (isRtl ? 1 : -1)) % monthsInYear);
        event.preventDefault();
        break;
      case 'ArrowRight':
        focusMonth((monthsInYear + month + (isRtl ? -1 : 1)) % monthsInYear);
        event.preventDefault();
        break;
      default:
        break;
    }
  });
  const handleMonthFocus = (0, _useEventCallback.default)((event, month) => {
    focusMonth(month);
  });
  const handleMonthBlur = (0, _useEventCallback.default)((event, month) => {
    if (focusedMonth === month) {
      changeHasFocus(false);
    }
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(MonthCalendarRoot, (0, _extends2.default)({
    ref: ref,
    className: (0, _clsx.default)(classes.root, className),
    ownerState: ownerState,
    role: "radiogroup",
    "aria-labelledby": gridLabelId,
    monthsPerRow: monthsPerRow
  }, other, {
    children: (0, _dateUtils.getMonthsInYear)(adapter, value ?? referenceDate).map(month => {
      const monthNumber = adapter.getMonth(month);
      const monthText = adapter.format(month, 'monthShort');
      const monthLabel = adapter.format(month, 'month');
      const isSelected = monthNumber === selectedMonth;
      const isDisabled = disabled || isMonthDisabled(month);
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_MonthCalendarButton.MonthCalendarButton, {
        selected: isSelected,
        value: monthNumber,
        onClick: handleMonthSelection,
        onKeyDown: handleKeyDown,
        autoFocus: internalHasFocus && monthNumber === focusedMonth,
        disabled: isDisabled,
        tabIndex: monthNumber === focusedMonth && !isDisabled ? 0 : -1,
        onFocus: handleMonthFocus,
        onBlur: handleMonthBlur,
        "aria-current": todayMonth === monthNumber ? 'date' : undefined,
        "aria-label": monthLabel,
        slots: slots,
        slotProps: slotProps,
        classes: classesProp,
        children: monthText
      }, monthText);
    })
  }));
});
if (process.env.NODE_ENV !== "production") MonthCalendar.displayName = "MonthCalendar";
process.env.NODE_ENV !== "production" ? MonthCalendar.propTypes = {
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
   * Months rendered per row.
   * @default 3
   */
  monthsPerRow: _propTypes.default.oneOf([3, 4]),
  /**
   * Callback fired when the value changes.
   * @param {PickerValidDate} value The new value.
   */
  onChange: _propTypes.default.func,
  onFocusedViewChange: _propTypes.default.func,
  onMonthFocus: _propTypes.default.func,
  /**
   * If `true`, the component is read-only.
   * When read-only, the value cannot be changed but the user can interact with the interface.
   * @default false
   */
  readOnly: _propTypes.default.bool,
  /**
   * The date used to generate the new value when both `value` and `defaultValue` are empty.
   * @default The closest valid month using the validation props, except callbacks such as `shouldDisableMonth`.
   */
  referenceDate: _propTypes.default.object,
  /**
   * Disable specific month.
   * @param {PickerValidDate} month The month to test.
   * @returns {boolean} If `true`, the month will be disabled.
   */
  shouldDisableMonth: _propTypes.default.func,
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
  value: _propTypes.default.object
} : void 0;
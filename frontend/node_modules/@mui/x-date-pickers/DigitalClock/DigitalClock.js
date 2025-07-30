"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DigitalClockItem = exports.DigitalClock = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _useSlotProps = _interopRequireDefault(require("@mui/utils/useSlotProps"));
var _styles = require("@mui/material/styles");
var _useEventCallback = _interopRequireDefault(require("@mui/utils/useEventCallback"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _MenuItem = _interopRequireDefault(require("@mui/material/MenuItem"));
var _MenuList = _interopRequireDefault(require("@mui/material/MenuList"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _hooks = require("../hooks");
var _useUtils = require("../internals/hooks/useUtils");
var _timeUtils = require("../internals/utils/time-utils");
var _PickerViewRoot = require("../internals/components/PickerViewRoot");
var _digitalClockClasses = require("./digitalClockClasses");
var _useViews = require("../internals/hooks/useViews");
var _dimensions = require("../internals/constants/dimensions");
var _useControlledValue = require("../internals/hooks/useControlledValue");
var _valueManagers = require("../internals/utils/valueManagers");
var _useClockReferenceDate = require("../internals/hooks/useClockReferenceDate");
var _utils = require("../internals/utils/utils");
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["ampm", "timeStep", "autoFocus", "slots", "slotProps", "value", "defaultValue", "referenceDate", "disableIgnoringDatePartForTimeValidation", "maxTime", "minTime", "disableFuture", "disablePast", "minutesStep", "shouldDisableTime", "onChange", "view", "openTo", "onViewChange", "focusedView", "onFocusedViewChange", "className", "classes", "disabled", "readOnly", "views", "skipDisabled", "timezone"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    list: ['list'],
    item: ['item']
  };
  return (0, _composeClasses.default)(slots, _digitalClockClasses.getDigitalClockUtilityClass, classes);
};
const DigitalClockRoot = (0, _styles.styled)(_PickerViewRoot.PickerViewRoot, {
  name: 'MuiDigitalClock',
  slot: 'Root'
})({
  overflowY: 'auto',
  width: '100%',
  scrollbarWidth: 'thin',
  '@media (prefers-reduced-motion: no-preference)': {
    scrollBehavior: 'auto'
  },
  maxHeight: _dimensions.DIGITAL_CLOCK_VIEW_HEIGHT,
  variants: [{
    props: {
      hasDigitalClockAlreadyBeenRendered: true
    },
    style: {
      '@media (prefers-reduced-motion: no-preference)': {
        scrollBehavior: 'smooth'
      }
    }
  }]
});
const DigitalClockList = (0, _styles.styled)(_MenuList.default, {
  name: 'MuiDigitalClock',
  slot: 'List'
})({
  padding: 0
});
const DigitalClockItem = exports.DigitalClockItem = (0, _styles.styled)(_MenuItem.default, {
  name: 'MuiDigitalClock',
  slot: 'Item',
  shouldForwardProp: prop => prop !== 'itemValue' && prop !== 'formattedValue'
})(({
  theme
}) => ({
  padding: '8px 16px',
  margin: '2px 4px',
  '&:first-of-type': {
    marginTop: 4
  },
  '&:hover': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.hoverOpacity})` : (0, _styles.alpha)(theme.palette.primary.main, theme.palette.action.hoverOpacity)
  },
  '&.Mui-selected': {
    backgroundColor: (theme.vars || theme).palette.primary.main,
    color: (theme.vars || theme).palette.primary.contrastText,
    '&:focus-visible, &:hover': {
      backgroundColor: (theme.vars || theme).palette.primary.dark
    }
  },
  '&.Mui-focusVisible': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.focusOpacity})` : (0, _styles.alpha)(theme.palette.primary.main, theme.palette.action.focusOpacity)
  }
}));
/**
 * Demos:
 *
 * - [TimePicker](https://mui.com/x/react-date-pickers/time-picker/)
 * - [DigitalClock](https://mui.com/x/react-date-pickers/digital-clock/)
 *
 * API:
 *
 * - [DigitalClock API](https://mui.com/x/api/date-pickers/digital-clock/)
 */
const DigitalClock = exports.DigitalClock = /*#__PURE__*/React.forwardRef(function DigitalClock(inProps, ref) {
  const adapter = (0, _hooks.usePickerAdapter)();
  const containerRef = React.useRef(null);
  const handleRef = (0, _useForkRef.default)(ref, containerRef);
  const listRef = React.useRef(null);
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiDigitalClock'
  });
  const {
      ampm = adapter.is12HourCycleInCurrentLocale(),
      timeStep = 30,
      autoFocus,
      slots,
      slotProps,
      value: valueProp,
      defaultValue,
      referenceDate: referenceDateProp,
      disableIgnoringDatePartForTimeValidation = false,
      maxTime,
      minTime,
      disableFuture,
      disablePast,
      minutesStep = 1,
      shouldDisableTime,
      onChange,
      view: inView,
      openTo,
      onViewChange,
      focusedView,
      onFocusedViewChange,
      className,
      classes: classesProp,
      disabled,
      readOnly,
      views = ['hours'],
      skipDisabled = false,
      timezone: timezoneProp
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const {
    value,
    handleValueChange: handleRawValueChange,
    timezone
  } = (0, _useControlledValue.useControlledValue)({
    name: 'DigitalClock',
    timezone: timezoneProp,
    value: valueProp,
    defaultValue,
    referenceDate: referenceDateProp,
    onChange,
    valueManager: _valueManagers.singleItemValueManager
  });
  const translations = (0, _hooks.usePickerTranslations)();
  const now = (0, _useUtils.useNow)(timezone);
  const {
    ownerState: pickerOwnerState
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const ownerState = (0, _extends2.default)({}, pickerOwnerState, {
    hasDigitalClockAlreadyBeenRendered: !!containerRef.current
  });
  const classes = useUtilityClasses(classesProp);
  const ClockItem = slots?.digitalClockItem ?? DigitalClockItem;
  const clockItemProps = (0, _useSlotProps.default)({
    elementType: ClockItem,
    externalSlotProps: slotProps?.digitalClockItem,
    ownerState,
    className: classes.item
  });
  const valueOrReferenceDate = (0, _useClockReferenceDate.useClockReferenceDate)({
    value,
    referenceDate: referenceDateProp,
    adapter,
    props,
    timezone
  });
  const handleValueChange = (0, _useEventCallback.default)(newValue => handleRawValueChange(newValue, 'finish', 'hours'));
  const {
    setValueAndGoToNextView
  } = (0, _useViews.useViews)({
    view: inView,
    views,
    openTo,
    onViewChange,
    onChange: handleValueChange,
    focusedView,
    onFocusedViewChange
  });
  const handleItemSelect = (0, _useEventCallback.default)(newValue => {
    setValueAndGoToNextView(newValue, 'finish');
  });
  (0, _useEnhancedEffect.default)(() => {
    if (containerRef.current === null) {
      return;
    }
    const activeItem = containerRef.current.querySelector('[role="listbox"] [role="option"][tabindex="0"], [role="listbox"] [role="option"][aria-selected="true"]');
    if (!activeItem) {
      return;
    }
    const offsetTop = activeItem.offsetTop;
    if (autoFocus || !!focusedView) {
      activeItem.focus();
    }

    // Subtracting the 4px of extra margin intended for the first visible section item
    containerRef.current.scrollTop = offsetTop - 4;
  });
  const isTimeDisabled = React.useCallback(valueToCheck => {
    const isAfter = (0, _timeUtils.createIsAfterIgnoreDatePart)(disableIgnoringDatePartForTimeValidation, adapter);
    const containsValidTime = () => {
      if (minTime && isAfter(minTime, valueToCheck)) {
        return false;
      }
      if (maxTime && isAfter(valueToCheck, maxTime)) {
        return false;
      }
      if (disableFuture && isAfter(valueToCheck, now)) {
        return false;
      }
      if (disablePast && isAfter(now, valueToCheck)) {
        return false;
      }
      return true;
    };
    const isValidValue = () => {
      if (adapter.getMinutes(valueToCheck) % minutesStep !== 0) {
        return false;
      }
      if (shouldDisableTime) {
        return !shouldDisableTime(valueToCheck, 'hours');
      }
      return true;
    };
    return !containsValidTime() || !isValidValue();
  }, [disableIgnoringDatePartForTimeValidation, adapter, minTime, maxTime, disableFuture, now, disablePast, minutesStep, shouldDisableTime]);
  const timeOptions = React.useMemo(() => {
    const result = [];
    const startOfDay = adapter.startOfDay(valueOrReferenceDate);
    let nextTimeStepOption = startOfDay;
    while (adapter.isSameDay(valueOrReferenceDate, nextTimeStepOption)) {
      result.push(nextTimeStepOption);
      nextTimeStepOption = adapter.addMinutes(nextTimeStepOption, timeStep);
    }
    return result;
  }, [valueOrReferenceDate, timeStep, adapter]);
  const focusedOptionIndex = timeOptions.findIndex(option => adapter.isEqual(option, valueOrReferenceDate));
  const handleKeyDown = event => {
    switch (event.key) {
      case 'PageUp':
        {
          const newIndex = (0, _utils.getFocusedListItemIndex)(listRef.current) - 5;
          const children = listRef.current.children;
          const newFocusedIndex = Math.max(0, newIndex);
          const childToFocus = children[newFocusedIndex];
          if (childToFocus) {
            childToFocus.focus();
          }
          event.preventDefault();
          break;
        }
      case 'PageDown':
        {
          const newIndex = (0, _utils.getFocusedListItemIndex)(listRef.current) + 5;
          const children = listRef.current.children;
          const newFocusedIndex = Math.min(children.length - 1, newIndex);
          const childToFocus = children[newFocusedIndex];
          if (childToFocus) {
            childToFocus.focus();
          }
          event.preventDefault();
          break;
        }
      default:
    }
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(DigitalClockRoot, (0, _extends2.default)({
    ref: handleRef,
    className: (0, _clsx.default)(classes.root, className),
    ownerState: ownerState
  }, other, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DigitalClockList, {
      ref: listRef,
      role: "listbox",
      "aria-label": translations.timePickerToolbarTitle,
      className: classes.list,
      onKeyDown: handleKeyDown,
      children: timeOptions.map((option, index) => {
        const optionDisabled = isTimeDisabled(option);
        if (skipDisabled && optionDisabled) {
          return null;
        }
        const isSelected = adapter.isEqual(option, value);
        const formattedValue = adapter.format(option, ampm ? 'fullTime12h' : 'fullTime24h');
        const isFocused = focusedOptionIndex === index || focusedOptionIndex === -1 && index === 0;
        const tabIndex = isFocused ? 0 : -1;
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(ClockItem, (0, _extends2.default)({
          onClick: () => !readOnly && handleItemSelect(option),
          selected: isSelected,
          disabled: disabled || optionDisabled,
          disableRipple: readOnly,
          role: "option"
          // aria-readonly is not supported here and does not have any effect
          ,
          "aria-disabled": readOnly,
          "aria-selected": isSelected,
          tabIndex: tabIndex,
          itemValue: option,
          formattedValue: formattedValue
        }, clockItemProps, {
          children: formattedValue
        }), `${option.valueOf()}-${formattedValue}`);
      })
    })
  }));
});
if (process.env.NODE_ENV !== "production") DigitalClock.displayName = "DigitalClock";
process.env.NODE_ENV !== "production" ? DigitalClock.propTypes = {
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
   * Controlled focused view.
   */
  focusedView: _propTypes.default.oneOf(['hours']),
  /**
   * Maximal selectable time.
   * The date part of the object will be ignored unless `props.disableIgnoringDatePartForTimeValidation === true`.
   */
  maxTime: _propTypes.default.object,
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
   * Callback fired on view change.
   * @template TView Type of the view. It will vary based on the Picker type and the `views` it uses.
   * @param {TView} view The new view.
   */
  onViewChange: _propTypes.default.func,
  /**
   * The default visible view.
   * Used when the component view is not controlled.
   * Must be a valid option from `views` list.
   */
  openTo: _propTypes.default.oneOf(['hours']),
  /**
   * If `true`, the component is read-only.
   * When read-only, the value cannot be changed but the user can interact with the interface.
   * @default false
   */
  readOnly: _propTypes.default.bool,
  /**
   * The date used to generate the new value when both `value` and `defaultValue` are empty.
   * @default The closest valid time using the validation props, except callbacks such as `shouldDisableTime`.
   */
  referenceDate: _propTypes.default.object,
  /**
   * Disable specific time.
   * @param {PickerValidDate} value The value to check.
   * @param {TimeView} view The clock type of the timeValue.
   * @returns {boolean} If `true` the time will be disabled.
   */
  shouldDisableTime: _propTypes.default.func,
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
   * Overrideable component slots.
   * @default {}
   */
  slots: _propTypes.default.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object]),
  /**
   * The time steps between two time options.
   * For example, if `timeStep = 45`, then the available time options will be `[00:00, 00:45, 01:30, 02:15, 03:00, etc.]`.
   * @default 30
   */
  timeStep: _propTypes.default.number,
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
  view: _propTypes.default.oneOf(['hours']),
  /**
   * Available views.
   * @default ['hours']
   */
  views: _propTypes.default.arrayOf(_propTypes.default.oneOf(['hours']))
} : void 0;
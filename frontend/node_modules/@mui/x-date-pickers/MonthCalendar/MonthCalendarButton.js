"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MonthCalendarButton = void 0;
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _styles = require("@mui/material/styles");
var _useSlotProps = _interopRequireDefault(require("@mui/utils/useSlotProps"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _monthCalendarClasses = require("./monthCalendarClasses");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["autoFocus", "classes", "disabled", "selected", "value", "onClick", "onKeyDown", "onFocus", "onBlur", "slots", "slotProps"];
const useUtilityClasses = (classes, ownerState) => {
  const slots = {
    button: ['button', ownerState.isMonthDisabled && 'disabled', ownerState.isMonthSelected && 'selected']
  };
  return (0, _composeClasses.default)(slots, _monthCalendarClasses.getMonthCalendarUtilityClass, classes);
};
const DefaultMonthButton = (0, _styles.styled)('button', {
  name: 'MuiMonthCalendar',
  slot: 'Button',
  overridesResolver: (_, styles) => [styles.button, {
    [`&.${_monthCalendarClasses.monthCalendarClasses.disabled}`]: styles.disabled
  }, {
    [`&.${_monthCalendarClasses.monthCalendarClasses.selected}`]: styles.selected
  }]
})(({
  theme
}) => (0, _extends2.default)({
  color: 'unset',
  backgroundColor: 'transparent',
  border: 0,
  outline: 0
}, theme.typography.subtitle1, {
  height: 36,
  width: 72,
  borderRadius: 18,
  cursor: 'pointer',
  '&:focus': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})` : (0, _styles.alpha)(theme.palette.action.active, theme.palette.action.hoverOpacity)
  },
  '&:hover': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})` : (0, _styles.alpha)(theme.palette.action.active, theme.palette.action.hoverOpacity)
  },
  '&:disabled': {
    cursor: 'auto',
    pointerEvents: 'none'
  },
  [`&.${_monthCalendarClasses.monthCalendarClasses.disabled}`]: {
    color: (theme.vars || theme).palette.text.secondary
  },
  [`&.${_monthCalendarClasses.monthCalendarClasses.selected}`]: {
    color: (theme.vars || theme).palette.primary.contrastText,
    backgroundColor: (theme.vars || theme).palette.primary.main,
    '&:focus, &:hover': {
      backgroundColor: (theme.vars || theme).palette.primary.dark
    }
  }
}));

/**
 * @ignore - do not document.
 */
const MonthCalendarButton = exports.MonthCalendarButton = /*#__PURE__*/React.memo(function MonthCalendarButton(props) {
  const {
      autoFocus,
      classes: classesProp,
      disabled,
      selected,
      value,
      onClick,
      onKeyDown,
      onFocus,
      onBlur,
      slots,
      slotProps
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const ref = React.useRef(null);
  const {
    ownerState: pickerOwnerState
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const ownerState = (0, _extends2.default)({}, pickerOwnerState, {
    isMonthDisabled: disabled,
    isMonthSelected: selected
  });
  const classes = useUtilityClasses(classesProp, ownerState);

  // We can't forward the `autoFocus` to the button because it is a native button, not a MUI Button
  (0, _useEnhancedEffect.default)(() => {
    if (autoFocus) {
      // `ref.current` being `null` would be a bug in MUI.
      ref.current?.focus();
    }
  }, [autoFocus]);
  const MonthButton = slots?.monthButton ?? DefaultMonthButton;
  const monthButtonProps = (0, _useSlotProps.default)({
    elementType: MonthButton,
    externalSlotProps: slotProps?.monthButton,
    externalForwardedProps: other,
    additionalProps: {
      disabled,
      ref,
      type: 'button',
      role: 'radio',
      'aria-checked': selected,
      onClick: event => onClick(event, value),
      onKeyDown: event => onKeyDown(event, value),
      onFocus: event => onFocus(event, value),
      onBlur: event => onBlur(event, value)
    },
    ownerState,
    className: classes.button
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(MonthButton, (0, _extends2.default)({}, monthButtonProps));
});
if (process.env.NODE_ENV !== "production") MonthCalendarButton.displayName = "MonthCalendarButton";
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.YearCalendarButton = void 0;
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _styles = require("@mui/material/styles");
var _useSlotProps = _interopRequireDefault(require("@mui/utils/useSlotProps"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _yearCalendarClasses = require("./yearCalendarClasses");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["autoFocus", "classes", "disabled", "selected", "value", "onClick", "onKeyDown", "onFocus", "onBlur", "slots", "slotProps"];
const useUtilityClasses = (classes, ownerState) => {
  const slots = {
    button: ['button', ownerState.isYearDisabled && 'disabled', ownerState.isYearSelected && 'selected']
  };
  return (0, _composeClasses.default)(slots, _yearCalendarClasses.getYearCalendarUtilityClass, classes);
};
const DefaultYearButton = (0, _styles.styled)('button', {
  name: 'MuiYearCalendar',
  slot: 'Button',
  overridesResolver: (_, styles) => [styles.button, {
    [`&.${_yearCalendarClasses.yearCalendarClasses.disabled}`]: styles.disabled
  }, {
    [`&.${_yearCalendarClasses.yearCalendarClasses.selected}`]: styles.selected
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
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.focusOpacity})` : (0, _styles.alpha)(theme.palette.action.active, theme.palette.action.focusOpacity)
  },
  '&:hover': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})` : (0, _styles.alpha)(theme.palette.action.active, theme.palette.action.hoverOpacity)
  },
  '&:disabled': {
    cursor: 'auto',
    pointerEvents: 'none'
  },
  [`&.${_yearCalendarClasses.yearCalendarClasses.disabled}`]: {
    color: (theme.vars || theme).palette.text.secondary
  },
  [`&.${_yearCalendarClasses.yearCalendarClasses.selected}`]: {
    color: (theme.vars || theme).palette.primary.contrastText,
    backgroundColor: (theme.vars || theme).palette.primary.main,
    '&:focus, &:hover': {
      backgroundColor: (theme.vars || theme).palette.primary.dark
    }
  }
}));

/**
 * @ignore - internal component.
 */
const YearCalendarButton = exports.YearCalendarButton = /*#__PURE__*/React.memo(function YearCalendarButton(props) {
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
    isYearDisabled: disabled,
    isYearSelected: selected
  });
  const classes = useUtilityClasses(classesProp, ownerState);

  // We can't forward the `autoFocus` to the button because it is a native button, not a MUI Button
  (0, _useEnhancedEffect.default)(() => {
    if (autoFocus) {
      // `ref.current` being `null` would be a bug in MUI.
      ref.current?.focus();
    }
  }, [autoFocus]);
  const YearButton = slots?.yearButton ?? DefaultYearButton;
  const yearButtonProps = (0, _useSlotProps.default)({
    elementType: YearButton,
    externalSlotProps: slotProps?.yearButton,
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(YearButton, (0, _extends2.default)({}, yearButtonProps));
});
if (process.env.NODE_ENV !== "production") YearCalendarButton.displayName = "YearCalendarButton";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
const _excluded = ["autoFocus", "classes", "disabled", "selected", "value", "onClick", "onKeyDown", "onFocus", "onBlur", "slots", "slotProps"];
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import useSlotProps from '@mui/utils/useSlotProps';
import composeClasses from '@mui/utils/composeClasses';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { usePickerPrivateContext } from "../internals/hooks/usePickerPrivateContext.js";
import { getYearCalendarUtilityClass, yearCalendarClasses } from "./yearCalendarClasses.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = (classes, ownerState) => {
  const slots = {
    button: ['button', ownerState.isYearDisabled && 'disabled', ownerState.isYearSelected && 'selected']
  };
  return composeClasses(slots, getYearCalendarUtilityClass, classes);
};
const DefaultYearButton = styled('button', {
  name: 'MuiYearCalendar',
  slot: 'Button',
  overridesResolver: (_, styles) => [styles.button, {
    [`&.${yearCalendarClasses.disabled}`]: styles.disabled
  }, {
    [`&.${yearCalendarClasses.selected}`]: styles.selected
  }]
})(({
  theme
}) => _extends({
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
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.focusOpacity})` : alpha(theme.palette.action.active, theme.palette.action.focusOpacity)
  },
  '&:hover': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})` : alpha(theme.palette.action.active, theme.palette.action.hoverOpacity)
  },
  '&:disabled': {
    cursor: 'auto',
    pointerEvents: 'none'
  },
  [`&.${yearCalendarClasses.disabled}`]: {
    color: (theme.vars || theme).palette.text.secondary
  },
  [`&.${yearCalendarClasses.selected}`]: {
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
export const YearCalendarButton = /*#__PURE__*/React.memo(function YearCalendarButton(props) {
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
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const ref = React.useRef(null);
  const {
    ownerState: pickerOwnerState
  } = usePickerPrivateContext();
  const ownerState = _extends({}, pickerOwnerState, {
    isYearDisabled: disabled,
    isYearSelected: selected
  });
  const classes = useUtilityClasses(classesProp, ownerState);

  // We can't forward the `autoFocus` to the button because it is a native button, not a MUI Button
  useEnhancedEffect(() => {
    if (autoFocus) {
      // `ref.current` being `null` would be a bug in MUI.
      ref.current?.focus();
    }
  }, [autoFocus]);
  const YearButton = slots?.yearButton ?? DefaultYearButton;
  const yearButtonProps = useSlotProps({
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
  return /*#__PURE__*/_jsx(YearButton, _extends({}, yearButtonProps));
});
if (process.env.NODE_ENV !== "production") YearCalendarButton.displayName = "YearCalendarButton";
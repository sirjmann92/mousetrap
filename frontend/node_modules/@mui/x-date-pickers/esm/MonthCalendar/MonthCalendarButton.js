import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
const _excluded = ["autoFocus", "classes", "disabled", "selected", "value", "onClick", "onKeyDown", "onFocus", "onBlur", "slots", "slotProps"];
import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import useSlotProps from '@mui/utils/useSlotProps';
import composeClasses from '@mui/utils/composeClasses';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { usePickerPrivateContext } from "../internals/hooks/usePickerPrivateContext.js";
import { getMonthCalendarUtilityClass, monthCalendarClasses } from "./monthCalendarClasses.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = (classes, ownerState) => {
  const slots = {
    button: ['button', ownerState.isMonthDisabled && 'disabled', ownerState.isMonthSelected && 'selected']
  };
  return composeClasses(slots, getMonthCalendarUtilityClass, classes);
};
const DefaultMonthButton = styled('button', {
  name: 'MuiMonthCalendar',
  slot: 'Button',
  overridesResolver: (_, styles) => [styles.button, {
    [`&.${monthCalendarClasses.disabled}`]: styles.disabled
  }, {
    [`&.${monthCalendarClasses.selected}`]: styles.selected
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
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})` : alpha(theme.palette.action.active, theme.palette.action.hoverOpacity)
  },
  '&:hover': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.action.activeChannel} / ${theme.vars.palette.action.hoverOpacity})` : alpha(theme.palette.action.active, theme.palette.action.hoverOpacity)
  },
  '&:disabled': {
    cursor: 'auto',
    pointerEvents: 'none'
  },
  [`&.${monthCalendarClasses.disabled}`]: {
    color: (theme.vars || theme).palette.text.secondary
  },
  [`&.${monthCalendarClasses.selected}`]: {
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
export const MonthCalendarButton = /*#__PURE__*/React.memo(function MonthCalendarButton(props) {
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
    isMonthDisabled: disabled,
    isMonthSelected: selected
  });
  const classes = useUtilityClasses(classesProp, ownerState);

  // We can't forward the `autoFocus` to the button because it is a native button, not a MUI Button
  useEnhancedEffect(() => {
    if (autoFocus) {
      // `ref.current` being `null` would be a bug in MUI.
      ref.current?.focus();
    }
  }, [autoFocus]);
  const MonthButton = slots?.monthButton ?? DefaultMonthButton;
  const monthButtonProps = useSlotProps({
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
  return /*#__PURE__*/_jsx(MonthButton, _extends({}, monthButtonProps));
});
if (process.env.NODE_ENV !== "production") MonthCalendarButton.displayName = "MonthCalendarButton";
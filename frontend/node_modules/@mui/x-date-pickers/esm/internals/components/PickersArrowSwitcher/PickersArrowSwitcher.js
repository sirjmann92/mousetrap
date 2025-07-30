import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["children", "className", "slots", "slotProps", "isNextDisabled", "isNextHidden", "onGoToNext", "nextLabel", "isPreviousDisabled", "isPreviousHidden", "onGoToPrevious", "previousLabel", "labelId", "classes"],
  _excluded2 = ["ownerState"],
  _excluded3 = ["ownerState"];
import * as React from 'react';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { useRtl } from '@mui/system/RtlProvider';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import useSlotProps from '@mui/utils/useSlotProps';
import IconButton from '@mui/material/IconButton';
import { ArrowLeftIcon, ArrowRightIcon } from "../../../icons/index.js";
import { getPickersArrowSwitcherUtilityClass } from "./pickersArrowSwitcherClasses.js";
import { usePickerPrivateContext } from "../../hooks/usePickerPrivateContext.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const PickersArrowSwitcherRoot = styled('div', {
  name: 'MuiPickersArrowSwitcher',
  slot: 'Root'
})({
  display: 'flex'
});
const PickersArrowSwitcherSpacer = styled('div', {
  name: 'MuiPickersArrowSwitcher',
  slot: 'Spacer'
})(({
  theme
}) => ({
  width: theme.spacing(3)
}));
const PickersArrowSwitcherButton = styled(IconButton, {
  name: 'MuiPickersArrowSwitcher',
  slot: 'Button'
})({
  variants: [{
    props: {
      isButtonHidden: true
    },
    style: {
      visibility: 'hidden'
    }
  }]
});
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    spacer: ['spacer'],
    button: ['button'],
    previousIconButton: ['previousIconButton'],
    nextIconButton: ['nextIconButton'],
    leftArrowIcon: ['leftArrowIcon'],
    rightArrowIcon: ['rightArrowIcon']
  };
  return composeClasses(slots, getPickersArrowSwitcherUtilityClass, classes);
};
export const PickersArrowSwitcher = /*#__PURE__*/React.forwardRef(function PickersArrowSwitcher(inProps, ref) {
  const isRtl = useRtl();
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPickersArrowSwitcher'
  });
  const {
      children,
      className,
      slots,
      slotProps,
      isNextDisabled,
      isNextHidden,
      onGoToNext,
      nextLabel,
      isPreviousDisabled,
      isPreviousHidden,
      onGoToPrevious,
      previousLabel,
      labelId,
      classes: classesProp
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const {
    ownerState
  } = usePickerPrivateContext();
  const classes = useUtilityClasses(classesProp);
  const nextProps = {
    isDisabled: isNextDisabled,
    isHidden: isNextHidden,
    goTo: onGoToNext,
    label: nextLabel
  };
  const previousProps = {
    isDisabled: isPreviousDisabled,
    isHidden: isPreviousHidden,
    goTo: onGoToPrevious,
    label: previousLabel
  };
  const PreviousIconButton = slots?.previousIconButton ?? PickersArrowSwitcherButton;
  const previousIconButtonProps = useSlotProps({
    elementType: PreviousIconButton,
    externalSlotProps: slotProps?.previousIconButton,
    additionalProps: {
      size: 'medium',
      title: previousProps.label,
      'aria-label': previousProps.label,
      disabled: previousProps.isDisabled,
      edge: 'end',
      onClick: previousProps.goTo
    },
    ownerState: _extends({}, ownerState, {
      isButtonHidden: previousProps.isHidden ?? false
    }),
    className: clsx(classes.button, classes.previousIconButton)
  });
  const NextIconButton = slots?.nextIconButton ?? PickersArrowSwitcherButton;
  const nextIconButtonProps = useSlotProps({
    elementType: NextIconButton,
    externalSlotProps: slotProps?.nextIconButton,
    additionalProps: {
      size: 'medium',
      title: nextProps.label,
      'aria-label': nextProps.label,
      disabled: nextProps.isDisabled,
      edge: 'start',
      onClick: nextProps.goTo
    },
    ownerState: _extends({}, ownerState, {
      isButtonHidden: nextProps.isHidden ?? false
    }),
    className: clsx(classes.button, classes.nextIconButton)
  });
  const LeftArrowIcon = slots?.leftArrowIcon ?? ArrowLeftIcon;
  // The spread is here to avoid this bug mui/material-ui#34056
  const _useSlotProps = useSlotProps({
      elementType: LeftArrowIcon,
      externalSlotProps: slotProps?.leftArrowIcon,
      additionalProps: {
        fontSize: 'inherit'
      },
      ownerState,
      className: classes.leftArrowIcon
    }),
    leftArrowIconProps = _objectWithoutPropertiesLoose(_useSlotProps, _excluded2);
  const RightArrowIcon = slots?.rightArrowIcon ?? ArrowRightIcon;
  // The spread is here to avoid this bug mui/material-ui#34056
  const _useSlotProps2 = useSlotProps({
      elementType: RightArrowIcon,
      externalSlotProps: slotProps?.rightArrowIcon,
      additionalProps: {
        fontSize: 'inherit'
      },
      ownerState,
      className: classes.rightArrowIcon
    }),
    rightArrowIconProps = _objectWithoutPropertiesLoose(_useSlotProps2, _excluded3);
  return /*#__PURE__*/_jsxs(PickersArrowSwitcherRoot, _extends({
    ref: ref,
    className: clsx(classes.root, className),
    ownerState: ownerState
  }, other, {
    children: [/*#__PURE__*/_jsx(PreviousIconButton, _extends({}, previousIconButtonProps, {
      children: isRtl ? /*#__PURE__*/_jsx(RightArrowIcon, _extends({}, rightArrowIconProps)) : /*#__PURE__*/_jsx(LeftArrowIcon, _extends({}, leftArrowIconProps))
    })), children ? /*#__PURE__*/_jsx(Typography, {
      variant: "subtitle1",
      component: "span",
      id: labelId,
      children: children
    }) : /*#__PURE__*/_jsx(PickersArrowSwitcherSpacer, {
      className: classes.spacer,
      ownerState: ownerState
    }), /*#__PURE__*/_jsx(NextIconButton, _extends({}, nextIconButtonProps, {
      children: isRtl ? /*#__PURE__*/_jsx(LeftArrowIcon, _extends({}, leftArrowIconProps)) : /*#__PURE__*/_jsx(RightArrowIcon, _extends({}, rightArrowIconProps))
    }))]
  }));
});
if (process.env.NODE_ENV !== "production") PickersArrowSwitcher.displayName = "PickersArrowSwitcher";
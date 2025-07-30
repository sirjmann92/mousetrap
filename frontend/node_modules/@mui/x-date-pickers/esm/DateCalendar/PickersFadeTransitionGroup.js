import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["children"];
import * as React from 'react';
import clsx from 'clsx';
import { TransitionGroup } from 'react-transition-group';
import Fade from '@mui/material/Fade';
import { styled, useTheme, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { getPickersFadeTransitionGroupUtilityClass } from "./pickersFadeTransitionGroupClasses.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = classes => {
  const slots = {
    root: ['root']
  };
  return composeClasses(slots, getPickersFadeTransitionGroupUtilityClass, classes);
};
const PickersFadeTransitionGroupRoot = styled(TransitionGroup, {
  name: 'MuiPickersFadeTransitionGroup',
  slot: 'Root'
})({
  display: 'block',
  position: 'relative'
});

/**
 * @ignore - do not document.
 */
export function PickersFadeTransitionGroup(inProps) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPickersFadeTransitionGroup'
  });
  const {
    className,
    reduceAnimations,
    transKey,
    classes: classesProp
  } = props;
  const {
      children
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const classes = useUtilityClasses(classesProp);
  const theme = useTheme();
  if (reduceAnimations) {
    return children;
  }
  return /*#__PURE__*/_jsx(PickersFadeTransitionGroupRoot, {
    className: clsx(classes.root, className),
    ownerState: other,
    children: /*#__PURE__*/_jsx(Fade, {
      appear: false,
      mountOnEnter: true,
      unmountOnExit: true,
      timeout: {
        appear: theme.transitions.duration.enteringScreen,
        enter: theme.transitions.duration.enteringScreen,
        exit: 0
      },
      children: children
    }, transKey)
  });
}
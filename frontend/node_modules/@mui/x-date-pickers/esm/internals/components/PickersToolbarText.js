import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className", "classes", "selected", "value"];
import * as React from 'react';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { getPickersToolbarTextUtilityClass } from "./pickersToolbarTextClasses.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = classes => {
  const slots = {
    root: ['root']
  };
  return composeClasses(slots, getPickersToolbarTextUtilityClass, classes);
};
const PickersToolbarTextRoot = styled(Typography, {
  name: 'MuiPickersToolbarText',
  slot: 'Root'
})(({
  theme
}) => ({
  transition: theme.transitions.create('color'),
  color: (theme.vars || theme).palette.text.secondary,
  [`&[data-selected]`]: {
    color: (theme.vars || theme).palette.text.primary
  }
}));
export const PickersToolbarText = /*#__PURE__*/React.forwardRef(function PickersToolbarText(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPickersToolbarText'
  });
  const {
      className,
      classes: classesProp,
      selected,
      value
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const classes = useUtilityClasses(classesProp);
  return /*#__PURE__*/_jsx(PickersToolbarTextRoot, _extends({
    ref: ref,
    className: clsx(classes.root, className),
    component: "span",
    ownerState: props
  }, selected && {
    'data-selected': true
  }, other, {
    children: value
  }));
});
if (process.env.NODE_ENV !== "production") PickersToolbarText.displayName = "PickersToolbarText";
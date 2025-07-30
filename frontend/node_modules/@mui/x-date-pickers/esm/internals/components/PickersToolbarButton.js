import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["align", "className", "classes", "selected", "typographyClassName", "value", "variant", "width"];
import * as React from 'react';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { PickersToolbarText } from "./PickersToolbarText.js";
import { getPickersToolbarUtilityClass } from "./pickersToolbarClasses.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = classes => {
  const slots = {
    root: ['root']
  };
  return composeClasses(slots, getPickersToolbarUtilityClass, classes);
};
const PickersToolbarButtonRoot = styled(Button, {
  name: 'MuiPickersToolbarButton',
  slot: 'Root'
})({
  padding: 0,
  minWidth: 16,
  textTransform: 'none'
});
export const PickersToolbarButton = /*#__PURE__*/React.forwardRef(function PickersToolbarButton(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPickersToolbarButton'
  });
  const {
      align,
      className,
      classes: classesProp,
      selected,
      typographyClassName,
      value,
      variant,
      width
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const classes = useUtilityClasses(classesProp);
  return /*#__PURE__*/_jsx(PickersToolbarButtonRoot, _extends({
    variant: "text",
    ref: ref,
    className: clsx(classes.root, className),
    ownerState: props
  }, width ? {
    sx: {
      width
    }
  } : {}, other, {
    children: /*#__PURE__*/_jsx(PickersToolbarText, {
      align: align,
      className: typographyClassName,
      variant: variant,
      value: value,
      selected: selected
    })
  }));
});
if (process.env.NODE_ENV !== "production") PickersToolbarButton.displayName = "PickersToolbarButton";
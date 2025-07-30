import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["children", "className", "classes", "toolbarTitle", "hidden", "titleId", "classes", "landscapeDirection"];
import * as React from 'react';
import clsx from 'clsx';
import Typography from '@mui/material/Typography';
import { styled, useThemeProps } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { shouldForwardProp } from '@mui/system/createStyled';
import { getPickersToolbarUtilityClass } from "./pickersToolbarClasses.js";
import { useToolbarOwnerState } from "../hooks/useToolbarOwnerState.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    title: ['title'],
    content: ['content']
  };
  return composeClasses(slots, getPickersToolbarUtilityClass, classes);
};
const PickersToolbarRoot = styled('div', {
  name: 'MuiPickersToolbar',
  slot: 'Root'
})(({
  theme
}) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  variants: [{
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      height: 'auto',
      maxWidth: 160,
      padding: 16,
      justifyContent: 'flex-start',
      flexWrap: 'wrap'
    }
  }]
}));
const PickersToolbarContent = styled('div', {
  name: 'MuiPickersToolbar',
  slot: 'Content',
  shouldForwardProp: prop => shouldForwardProp(prop) && prop !== 'landscapeDirection'
})({
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  flex: 1,
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row',
  variants: [{
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'column'
    }
  }, {
    props: {
      pickerOrientation: 'landscape',
      landscapeDirection: 'row'
    },
    style: {
      flexDirection: 'row'
    }
  }]
});
export const PickersToolbar = /*#__PURE__*/React.forwardRef(function PickersToolbar(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPickersToolbar'
  });
  const {
      children,
      className,
      classes: classesProp,
      toolbarTitle,
      hidden,
      titleId,
      landscapeDirection
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const ownerState = useToolbarOwnerState();
  const classes = useUtilityClasses(classesProp);
  if (hidden) {
    return null;
  }
  return /*#__PURE__*/_jsxs(PickersToolbarRoot, _extends({
    ref: ref,
    className: clsx(classes.root, className),
    ownerState: ownerState
  }, other, {
    children: [/*#__PURE__*/_jsx(Typography, {
      color: "text.secondary",
      variant: "overline",
      id: titleId,
      className: classes.title,
      children: toolbarTitle
    }), /*#__PURE__*/_jsx(PickersToolbarContent, {
      className: classes.content,
      ownerState: ownerState,
      landscapeDirection: landscapeDirection,
      children: children
    })]
  }));
});
if (process.env.NODE_ENV !== "production") PickersToolbar.displayName = "PickersToolbar";
import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className"];
import * as React from 'react';
import clsx from 'clsx';
import { styled } from '@mui/material/styles';
import composeClasses from '@mui/utils/composeClasses';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { getDataGridUtilityClass } from "../../constants/gridClasses.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['panelWrapper']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridPanelWrapperRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'PanelWrapper'
})({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  '&:focus': {
    outline: 0
  }
});
const GridPanelWrapper = forwardRef(function GridPanelWrapper(props, ref) {
  const {
      className
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/_jsx(GridPanelWrapperRoot, _extends({
    tabIndex: -1,
    className: clsx(classes.root, className),
    ownerState: rootProps
  }, other, {
    ref: ref
  }));
});
if (process.env.NODE_ENV !== "production") GridPanelWrapper.displayName = "GridPanelWrapper";
export { GridPanelWrapper };
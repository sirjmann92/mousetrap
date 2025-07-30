import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className", "selectedRowCount"];
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '@mui/system';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { vars } from "../constants/cssVariables.js";
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { getDataGridUtilityClass } from "../constants/gridClasses.js";
import { useGridRootProps } from "../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['selectedRowCount']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridSelectedRowCountRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'SelectedRowCount'
})({
  alignItems: 'center',
  display: 'flex',
  margin: vars.spacing(0, 2),
  visibility: 'hidden',
  width: 0,
  height: 0,
  [vars.breakpoints.up('sm')]: {
    visibility: 'visible',
    width: 'auto',
    height: 'auto'
  }
});
const GridSelectedRowCount = forwardRef(function GridSelectedRowCount(props, ref) {
  const {
      className,
      selectedRowCount
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const apiRef = useGridApiContext();
  const ownerState = useGridRootProps();
  const classes = useUtilityClasses(ownerState);
  const rowSelectedText = apiRef.current.getLocaleText('footerRowSelected')(selectedRowCount);
  return /*#__PURE__*/_jsx(GridSelectedRowCountRoot, _extends({
    className: clsx(classes.root, className),
    ownerState: ownerState
  }, other, {
    ref: ref,
    children: rowSelectedText
  }));
});
if (process.env.NODE_ENV !== "production") GridSelectedRowCount.displayName = "GridSelectedRowCount";
process.env.NODE_ENV !== "production" ? GridSelectedRowCount.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  selectedRowCount: PropTypes.number.isRequired,
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { GridSelectedRowCount };
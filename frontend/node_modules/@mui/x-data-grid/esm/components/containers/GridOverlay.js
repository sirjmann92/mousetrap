import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className"];
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '@mui/system';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { vars } from "../../constants/cssVariables.js";
import { getDataGridUtilityClass } from "../../constants/gridClasses.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['overlay']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridOverlayRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'Overlay'
})({
  width: '100%',
  height: '100%',
  display: 'flex',
  gap: vars.spacing(1),
  flexDirection: 'column',
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  textWrap: 'balance',
  backgroundColor: vars.colors.background.backdrop
});
const GridOverlay = forwardRef(function GridOverlay(props, ref) {
  const {
      className
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/_jsx(GridOverlayRoot, _extends({
    className: clsx(classes.root, className),
    ownerState: rootProps
  }, other, {
    ref: ref
  }));
});
if (process.env.NODE_ENV !== "production") GridOverlay.displayName = "GridOverlay";
process.env.NODE_ENV !== "production" ? GridOverlay.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { GridOverlay };
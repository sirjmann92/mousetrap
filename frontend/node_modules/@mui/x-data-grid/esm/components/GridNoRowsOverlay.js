import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { GridOverlay } from "./containers/GridOverlay.js";
import { jsx as _jsx } from "react/jsx-runtime";
const GridNoRowsOverlay = forwardRef(function GridNoRowsOverlay(props, ref) {
  const apiRef = useGridApiContext();
  const noRowsLabel = apiRef.current.getLocaleText('noRowsLabel');
  return /*#__PURE__*/_jsx(GridOverlay, _extends({}, props, {
    ref: ref,
    children: noRowsLabel
  }));
});
if (process.env.NODE_ENV !== "production") GridNoRowsOverlay.displayName = "GridNoRowsOverlay";
process.env.NODE_ENV !== "production" ? GridNoRowsOverlay.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { GridNoRowsOverlay };
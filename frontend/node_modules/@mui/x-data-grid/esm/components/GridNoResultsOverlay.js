import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { GridOverlay } from "./containers/GridOverlay.js";
import { jsx as _jsx } from "react/jsx-runtime";
export const GridNoResultsOverlay = forwardRef(function GridNoResultsOverlay(props, ref) {
  const apiRef = useGridApiContext();
  const noResultsOverlayLabel = apiRef.current.getLocaleText('noResultsOverlayLabel');
  return /*#__PURE__*/_jsx(GridOverlay, _extends({}, props, {
    ref: ref,
    children: noResultsOverlayLabel
  }));
});
if (process.env.NODE_ENV !== "production") GridNoResultsOverlay.displayName = "GridNoResultsOverlay";
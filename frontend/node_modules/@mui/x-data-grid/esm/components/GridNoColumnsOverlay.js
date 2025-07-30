import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridRootProps } from "../hooks/utils/useGridRootProps.js";
import { useGridApiContext } from "../hooks/utils/useGridApiContext.js";
import { GridOverlay } from "./containers/GridOverlay.js";
import { GridPreferencePanelsValue } from "../hooks/features/preferencesPanel/gridPreferencePanelsValue.js";
import { gridColumnFieldsSelector, useGridSelector } from "../hooks/index.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const GridNoColumnsOverlay = forwardRef(function GridNoColumnsOverlay(props, ref) {
  const rootProps = useGridRootProps();
  const apiRef = useGridApiContext();
  const columns = useGridSelector(apiRef, gridColumnFieldsSelector);
  const handleOpenManageColumns = () => {
    apiRef.current.showPreferences(GridPreferencePanelsValue.columns);
  };
  const showManageColumnsButton = !rootProps.disableColumnSelector && columns.length > 0;
  return /*#__PURE__*/_jsxs(GridOverlay, _extends({}, props, {
    ref: ref,
    children: [apiRef.current.getLocaleText('noColumnsOverlayLabel'), showManageColumnsButton && /*#__PURE__*/_jsx(rootProps.slots.baseButton, _extends({
      size: "small"
    }, rootProps.slotProps?.baseButton, {
      onClick: handleOpenManageColumns,
      children: apiRef.current.getLocaleText('noColumnsOverlayManageColumns')
    }))]
  }));
});
if (process.env.NODE_ENV !== "production") GridNoColumnsOverlay.displayName = "GridNoColumnsOverlay";
process.env.NODE_ENV !== "production" ? GridNoColumnsOverlay.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { GridNoColumnsOverlay };
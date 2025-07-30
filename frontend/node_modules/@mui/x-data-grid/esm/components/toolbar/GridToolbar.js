import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className", "csvOptions", "printOptions", "excelOptions", "showQuickFilter", "quickFilterProps"];
import * as React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { GridToolbarContainer } from "../containers/GridToolbarContainer.js";
import { GridToolbarColumnsButton } from "./GridToolbarColumnsButton.js";
import { GridToolbarDensitySelector } from "./GridToolbarDensitySelector.js";
import { GridToolbarFilterButton } from "./GridToolbarFilterButton.js";
import { GridToolbarExport } from "./GridToolbarExport.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { GridToolbarQuickFilter } from "./GridToolbarQuickFilter.js";
import { GridToolbarLabel } from "../toolbarV8/GridToolbar.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * @deprecated Use the `showToolbar` prop to show the default toolbar instead. This component will be removed in a future major release.
 */
const GridToolbar = forwardRef(function GridToolbar(props, ref) {
  // TODO v7: think about where export option should be passed.
  // from slotProps={{ toolbarExport: { ...exportOption } }} seems to be more appropriate
  const _ref = props,
    {
      csvOptions,
      printOptions,
      excelOptions,
      showQuickFilter = true,
      quickFilterProps = {}
    } = _ref,
    other = _objectWithoutPropertiesLoose(_ref, _excluded);
  const rootProps = useGridRootProps();
  if (rootProps.disableColumnFilter && rootProps.disableColumnSelector && rootProps.disableDensitySelector && !showQuickFilter) {
    return null;
  }
  return /*#__PURE__*/_jsxs(GridToolbarContainer, _extends({}, other, {
    ref: ref,
    children: [rootProps.label && /*#__PURE__*/_jsx(GridToolbarLabel, {
      children: rootProps.label
    }), /*#__PURE__*/_jsx(GridToolbarColumnsButton, {}), /*#__PURE__*/_jsx(GridToolbarFilterButton, {}), /*#__PURE__*/_jsx(GridToolbarDensitySelector, {}), /*#__PURE__*/_jsx(GridToolbarExport, {
      csvOptions: csvOptions,
      printOptions: printOptions
      // @ts-ignore
      ,
      excelOptions: excelOptions
    }), /*#__PURE__*/_jsx("div", {
      style: {
        flex: 1
      }
    }), showQuickFilter && /*#__PURE__*/_jsx(GridToolbarQuickFilter, _extends({}, quickFilterProps))]
  }));
});
if (process.env.NODE_ENV !== "production") GridToolbar.displayName = "GridToolbar";
process.env.NODE_ENV !== "production" ? GridToolbar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  csvOptions: PropTypes.object,
  printOptions: PropTypes.object,
  /**
   * Props passed to the quick filter component.
   */
  quickFilterProps: PropTypes.shape({
    className: PropTypes.string,
    debounceMs: PropTypes.number,
    quickFilterFormatter: PropTypes.func,
    quickFilterParser: PropTypes.func,
    slotProps: PropTypes.object
  }),
  /**
   * Show the quick filter component.
   * @default true
   */
  showQuickFilter: PropTypes.bool,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.object,
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { GridToolbar };
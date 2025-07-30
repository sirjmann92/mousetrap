import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useGridSelector } from "../../utils/index.js";
import { useGridApiContext } from "../../utils/useGridApiContext.js";
import { useGridRootProps } from "../../utils/useGridRootProps.js";
import { gridExpandedRowCountSelector } from "../filter/index.js";
import { gridRowCountSelector, gridRowsLoadingSelector } from "../rows/index.js";
import { gridPinnedRowsCountSelector } from "../rows/gridRowsSelector.js";
import { GridOverlayWrapper } from "../../../components/base/GridOverlays.js";
import { gridVisibleColumnDefinitionsSelector } from "../columns/index.js";
import { gridPivotActiveSelector } from "../pivoting/index.js";

/**
 * Uses the grid state to determine which overlay to display.
 * Returns the active overlay type and the active loading overlay variant.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export const useGridOverlays = () => {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const totalRowCount = useGridSelector(apiRef, gridRowCountSelector);
  const visibleRowCount = useGridSelector(apiRef, gridExpandedRowCountSelector);
  const pinnedRowsCount = useGridSelector(apiRef, gridPinnedRowsCountSelector);
  const visibleColumns = useGridSelector(apiRef, gridVisibleColumnDefinitionsSelector);
  const noRows = totalRowCount === 0 && pinnedRowsCount === 0;
  const loading = useGridSelector(apiRef, gridRowsLoadingSelector);
  const pivotActive = useGridSelector(apiRef, gridPivotActiveSelector);
  const showNoRowsOverlay = !loading && noRows;
  const showNoResultsOverlay = !loading && totalRowCount > 0 && visibleRowCount === 0;
  const showNoColumnsOverlay = !loading && visibleColumns.length === 0;
  const showEmptyPivotOverlay = showNoRowsOverlay && pivotActive;
  let overlayType = null;
  let loadingOverlayVariant = null;
  if (showNoRowsOverlay) {
    overlayType = 'noRowsOverlay';
  }
  if (showNoColumnsOverlay) {
    overlayType = 'noColumnsOverlay';
  }
  if (showEmptyPivotOverlay) {
    overlayType = 'emptyPivotOverlay';
  }
  if (showNoResultsOverlay) {
    overlayType = 'noResultsOverlay';
  }
  if (loading) {
    overlayType = 'loadingOverlay';
    loadingOverlayVariant = rootProps.slotProps?.loadingOverlay?.[noRows ? 'noRowsVariant' : 'variant'] ?? (noRows ? 'skeleton' : 'linear-progress');
  }
  const overlaysProps = {
    overlayType: overlayType,
    loadingOverlayVariant
  };
  const getOverlay = () => {
    if (!overlayType) {
      return null;
    }
    const Overlay = rootProps.slots?.[overlayType];
    const overlayProps = rootProps.slotProps?.[overlayType];
    return /*#__PURE__*/_jsx(GridOverlayWrapper, _extends({}, overlaysProps, {
      children: /*#__PURE__*/_jsx(Overlay, _extends({}, overlayProps))
    }));
  };
  if (process.env.NODE_ENV !== "production") getOverlay.displayName = "getOverlay";
  return {
    getOverlay,
    overlaysProps
  };
};
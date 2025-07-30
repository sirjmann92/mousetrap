"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridOverlays = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _utils = require("../../utils");
var _useGridApiContext = require("../../utils/useGridApiContext");
var _useGridRootProps = require("../../utils/useGridRootProps");
var _filter = require("../filter");
var _rows = require("../rows");
var _gridRowsSelector = require("../rows/gridRowsSelector");
var _GridOverlays = require("../../../components/base/GridOverlays");
var _columns = require("../columns");
var _pivoting = require("../pivoting");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * Uses the grid state to determine which overlay to display.
 * Returns the active overlay type and the active loading overlay variant.
 */
const useGridOverlays = () => {
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const totalRowCount = (0, _utils.useGridSelector)(apiRef, _rows.gridRowCountSelector);
  const visibleRowCount = (0, _utils.useGridSelector)(apiRef, _filter.gridExpandedRowCountSelector);
  const pinnedRowsCount = (0, _utils.useGridSelector)(apiRef, _gridRowsSelector.gridPinnedRowsCountSelector);
  const visibleColumns = (0, _utils.useGridSelector)(apiRef, _columns.gridVisibleColumnDefinitionsSelector);
  const noRows = totalRowCount === 0 && pinnedRowsCount === 0;
  const loading = (0, _utils.useGridSelector)(apiRef, _rows.gridRowsLoadingSelector);
  const pivotActive = (0, _utils.useGridSelector)(apiRef, _pivoting.gridPivotActiveSelector);
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
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_GridOverlays.GridOverlayWrapper, (0, _extends2.default)({}, overlaysProps, {
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Overlay, (0, _extends2.default)({}, overlayProps))
    }));
  };
  if (process.env.NODE_ENV !== "production") getOverlay.displayName = "getOverlay";
  return {
    getOverlay,
    overlaysProps
  };
};
exports.useGridOverlays = useGridOverlays;
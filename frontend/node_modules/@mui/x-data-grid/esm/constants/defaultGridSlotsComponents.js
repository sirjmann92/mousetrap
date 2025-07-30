import _extends from "@babel/runtime/helpers/esm/extends";
import { GridSkeletonCell, GridColumnsPanel, GridFilterPanel, GridFooter, GridLoadingOverlay, GridNoRowsOverlay, GridPagination, GridPanel, GridRow, GridColumnHeaderFilterIconButton, GridRowCount, GridColumnsManagement, GridColumnHeaderSortIcon, GridNoColumnsOverlay } from "../components/index.js";
import { GridCell } from "../components/cell/GridCell.js";
import { GridColumnHeaders } from "../components/GridColumnHeaders.js";
import { GridColumnMenu } from "../components/menu/columnMenu/GridColumnMenu.js";
import { GridDetailPanels } from "../components/GridDetailPanels.js";
import { GridPinnedRows } from "../components/GridPinnedRows.js";
import { GridNoResultsOverlay } from "../components/GridNoResultsOverlay.js";
import materialSlots from "../material/index.js";
import { GridBottomContainer } from "../components/virtualization/GridBottomContainer.js";
import { GridToolbar } from "../components/toolbarV8/GridToolbar.js";

// TODO: camelCase these key. It's a private helper now.
// Remove then need to call `uncapitalizeObjectKeys`.
export const DATA_GRID_DEFAULT_SLOTS_COMPONENTS = _extends({}, materialSlots, {
  cell: GridCell,
  skeletonCell: GridSkeletonCell,
  columnHeaderFilterIconButton: GridColumnHeaderFilterIconButton,
  columnHeaderSortIcon: GridColumnHeaderSortIcon,
  columnMenu: GridColumnMenu,
  columnHeaders: GridColumnHeaders,
  detailPanels: GridDetailPanels,
  bottomContainer: GridBottomContainer,
  footer: GridFooter,
  footerRowCount: GridRowCount,
  toolbar: GridToolbar,
  pinnedRows: GridPinnedRows,
  loadingOverlay: GridLoadingOverlay,
  noResultsOverlay: GridNoResultsOverlay,
  noRowsOverlay: GridNoRowsOverlay,
  noColumnsOverlay: GridNoColumnsOverlay,
  pagination: GridPagination,
  filterPanel: GridFilterPanel,
  columnsPanel: GridColumnsPanel,
  columnsManagement: GridColumnsManagement,
  panel: GridPanel,
  row: GridRow
});
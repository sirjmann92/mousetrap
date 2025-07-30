import { renderEditInputCell } from "../components/cell/GridEditInputCell.js";
import { gridStringOrNumberComparator } from "../hooks/features/sorting/gridSortingUtils.js";
import { getGridStringOperators, getGridStringQuickFilterFn } from "./gridStringOperators.js";

/**
 * TODO: Move pro and premium properties outside of this Community file
 */
export const GRID_STRING_COL_DEF = {
  width: 100,
  minWidth: 50,
  maxWidth: Infinity,
  hideable: true,
  sortable: true,
  resizable: true,
  filterable: true,
  groupable: true,
  pinnable: true,
  // @ts-ignore
  aggregable: true,
  editable: false,
  sortComparator: gridStringOrNumberComparator,
  type: 'string',
  align: 'left',
  filterOperators: getGridStringOperators(),
  renderEditCell: renderEditInputCell,
  getApplyQuickFilterFn: getGridStringQuickFilterFn
};
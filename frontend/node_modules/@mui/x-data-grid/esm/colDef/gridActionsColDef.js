import _extends from "@babel/runtime/helpers/esm/extends";
import { GRID_STRING_COL_DEF } from "./gridStringColDef.js";
import { renderActionsCell } from "../components/cell/GridActionsCell.js";
export const GRID_ACTIONS_COLUMN_TYPE = 'actions';
export const GRID_ACTIONS_COL_DEF = _extends({}, GRID_STRING_COL_DEF, {
  sortable: false,
  filterable: false,
  // @ts-ignore
  aggregable: false,
  width: 100,
  display: 'flex',
  align: 'center',
  headerAlign: 'center',
  headerName: '',
  disableColumnMenu: true,
  disableExport: true,
  renderCell: renderActionsCell,
  getApplyQuickFilterFn: () => null
});
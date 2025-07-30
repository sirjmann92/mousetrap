import _extends from "@babel/runtime/helpers/esm/extends";
import { GRID_STRING_COL_DEF } from "./gridStringColDef.js";
import { renderBooleanCell } from "../components/cell/GridBooleanCell.js";
import { renderEditBooleanCell } from "../components/cell/GridEditBooleanCell.js";
import { gridNumberComparator } from "../hooks/features/sorting/gridSortingUtils.js";
import { getGridBooleanOperators } from "./gridBooleanOperators.js";
const gridBooleanFormatter = (value, row, column, apiRef) => {
  return value ? apiRef.current.getLocaleText('booleanCellTrueLabel') : apiRef.current.getLocaleText('booleanCellFalseLabel');
};
const stringToBoolean = value => {
  switch (value.toLowerCase().trim()) {
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'false':
    case 'no':
    case '0':
    case 'null':
    case 'undefined':
      return false;
    default:
      return undefined;
  }
};
export const GRID_BOOLEAN_COL_DEF = _extends({}, GRID_STRING_COL_DEF, {
  type: 'boolean',
  display: 'flex',
  align: 'center',
  headerAlign: 'center',
  renderCell: renderBooleanCell,
  renderEditCell: renderEditBooleanCell,
  sortComparator: gridNumberComparator,
  valueFormatter: gridBooleanFormatter,
  filterOperators: getGridBooleanOperators(),
  getApplyQuickFilterFn: () => null,
  // @ts-ignore
  aggregable: false,
  // @ts-ignore
  pastedValueParser: value => stringToBoolean(value)
});
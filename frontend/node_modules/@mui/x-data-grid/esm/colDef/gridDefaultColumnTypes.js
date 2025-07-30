import { GRID_STRING_COL_DEF } from "./gridStringColDef.js";
import { GRID_NUMERIC_COL_DEF } from "./gridNumericColDef.js";
import { GRID_DATE_COL_DEF, GRID_DATETIME_COL_DEF } from "./gridDateColDef.js";
import { GRID_BOOLEAN_COL_DEF } from "./gridBooleanColDef.js";
import { GRID_SINGLE_SELECT_COL_DEF } from "./gridSingleSelectColDef.js";
import { GRID_ACTIONS_COL_DEF, GRID_ACTIONS_COLUMN_TYPE } from "./gridActionsColDef.js";
export const DEFAULT_GRID_COL_TYPE_KEY = 'string';
export const getGridDefaultColumnTypes = () => {
  const nativeColumnTypes = {
    string: GRID_STRING_COL_DEF,
    number: GRID_NUMERIC_COL_DEF,
    date: GRID_DATE_COL_DEF,
    dateTime: GRID_DATETIME_COL_DEF,
    boolean: GRID_BOOLEAN_COL_DEF,
    singleSelect: GRID_SINGLE_SELECT_COL_DEF,
    [GRID_ACTIONS_COLUMN_TYPE]: GRID_ACTIONS_COL_DEF,
    custom: GRID_STRING_COL_DEF
  };
  return nativeColumnTypes;
};
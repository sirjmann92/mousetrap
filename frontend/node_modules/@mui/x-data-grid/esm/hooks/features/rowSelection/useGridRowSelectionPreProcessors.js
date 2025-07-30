import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import composeClasses from '@mui/utils/composeClasses';
import { useGridRegisterPipeProcessor } from "../../core/pipeProcessing/index.js";
import { getDataGridUtilityClass } from "../../../constants/index.js";
import { GRID_CHECKBOX_SELECTION_COL_DEF, GRID_CHECKBOX_SELECTION_FIELD } from "../../../colDef/index.js";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  return React.useMemo(() => {
    const slots = {
      cellCheckbox: ['cellCheckbox'],
      columnHeaderCheckbox: ['columnHeaderCheckbox']
    };
    return composeClasses(slots, getDataGridUtilityClass, classes);
  }, [classes]);
};
export const useGridRowSelectionPreProcessors = (apiRef, props) => {
  const ownerState = {
    classes: props.classes
  };
  const classes = useUtilityClasses(ownerState);
  const updateSelectionColumn = React.useCallback(columnsState => {
    const selectionColumn = _extends({}, GRID_CHECKBOX_SELECTION_COL_DEF, {
      cellClassName: classes.cellCheckbox,
      headerClassName: classes.columnHeaderCheckbox,
      headerName: apiRef.current.getLocaleText('checkboxSelectionHeaderName')
    });
    const shouldHaveSelectionColumn = props.checkboxSelection;
    const hasSelectionColumn = columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD] != null;
    if (shouldHaveSelectionColumn && !hasSelectionColumn) {
      columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD] = selectionColumn;
      columnsState.orderedFields = [GRID_CHECKBOX_SELECTION_FIELD, ...columnsState.orderedFields];
    } else if (!shouldHaveSelectionColumn && hasSelectionColumn) {
      delete columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD];
      columnsState.orderedFields = columnsState.orderedFields.filter(field => field !== GRID_CHECKBOX_SELECTION_FIELD);
    } else if (shouldHaveSelectionColumn && hasSelectionColumn) {
      columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD] = _extends({}, selectionColumn, columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD]);
      // If the column is not in the columns array (not a custom selection column), move it to the beginning of the column order
      if (!props.columns.some(col => col.field === GRID_CHECKBOX_SELECTION_FIELD)) {
        columnsState.orderedFields = [GRID_CHECKBOX_SELECTION_FIELD, ...columnsState.orderedFields.filter(field => field !== GRID_CHECKBOX_SELECTION_FIELD)];
      }
    }
    return columnsState;
  }, [apiRef, classes, props.columns, props.checkboxSelection]);
  useGridRegisterPipeProcessor(apiRef, 'hydrateColumns', updateSelectionColumn);
};
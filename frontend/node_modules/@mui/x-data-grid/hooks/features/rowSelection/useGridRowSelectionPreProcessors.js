"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridRowSelectionPreProcessors = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _pipeProcessing = require("../../core/pipeProcessing");
var _constants = require("../../../constants");
var _colDef = require("../../../colDef");
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  return React.useMemo(() => {
    const slots = {
      cellCheckbox: ['cellCheckbox'],
      columnHeaderCheckbox: ['columnHeaderCheckbox']
    };
    return (0, _composeClasses.default)(slots, _constants.getDataGridUtilityClass, classes);
  }, [classes]);
};
const useGridRowSelectionPreProcessors = (apiRef, props) => {
  const ownerState = {
    classes: props.classes
  };
  const classes = useUtilityClasses(ownerState);
  const updateSelectionColumn = React.useCallback(columnsState => {
    const selectionColumn = (0, _extends2.default)({}, _colDef.GRID_CHECKBOX_SELECTION_COL_DEF, {
      cellClassName: classes.cellCheckbox,
      headerClassName: classes.columnHeaderCheckbox,
      headerName: apiRef.current.getLocaleText('checkboxSelectionHeaderName')
    });
    const shouldHaveSelectionColumn = props.checkboxSelection;
    const hasSelectionColumn = columnsState.lookup[_colDef.GRID_CHECKBOX_SELECTION_FIELD] != null;
    if (shouldHaveSelectionColumn && !hasSelectionColumn) {
      columnsState.lookup[_colDef.GRID_CHECKBOX_SELECTION_FIELD] = selectionColumn;
      columnsState.orderedFields = [_colDef.GRID_CHECKBOX_SELECTION_FIELD, ...columnsState.orderedFields];
    } else if (!shouldHaveSelectionColumn && hasSelectionColumn) {
      delete columnsState.lookup[_colDef.GRID_CHECKBOX_SELECTION_FIELD];
      columnsState.orderedFields = columnsState.orderedFields.filter(field => field !== _colDef.GRID_CHECKBOX_SELECTION_FIELD);
    } else if (shouldHaveSelectionColumn && hasSelectionColumn) {
      columnsState.lookup[_colDef.GRID_CHECKBOX_SELECTION_FIELD] = (0, _extends2.default)({}, selectionColumn, columnsState.lookup[_colDef.GRID_CHECKBOX_SELECTION_FIELD]);
      // If the column is not in the columns array (not a custom selection column), move it to the beginning of the column order
      if (!props.columns.some(col => col.field === _colDef.GRID_CHECKBOX_SELECTION_FIELD)) {
        columnsState.orderedFields = [_colDef.GRID_CHECKBOX_SELECTION_FIELD, ...columnsState.orderedFields.filter(field => field !== _colDef.GRID_CHECKBOX_SELECTION_FIELD)];
      }
    }
    return columnsState;
  }, [apiRef, classes, props.columns, props.checkboxSelection]);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'hydrateColumns', updateSelectionColumn);
};
exports.useGridRowSelectionPreProcessors = useGridRowSelectionPreProcessors;
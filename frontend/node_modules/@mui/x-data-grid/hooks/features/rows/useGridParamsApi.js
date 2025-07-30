"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MissingRowIdError = void 0;
exports.useGridParamsApi = useGridParamsApi;
var React = _interopRequireWildcard(require("react"));
var _domUtils = require("../../../utils/domUtils");
var _useGridApiMethod = require("../../utils/useGridApiMethod");
var _gridFocusStateSelector = require("../focus/gridFocusStateSelector");
var _gridListViewSelectors = require("../listView/gridListViewSelectors");
var _gridRowsSelector = require("./gridRowsSelector");
var _gridRowsUtils = require("./gridRowsUtils");
class MissingRowIdError extends Error {}

/**
 * @requires useGridColumns (method)
 * @requires useGridRows (method)
 * @requires useGridFocus (state)
 * @requires useGridEditing (method)
 * TODO: Impossible priority - useGridEditing also needs to be after useGridParamsApi
 * TODO: Impossible priority - useGridFocus also needs to be after useGridParamsApi
 */
exports.MissingRowIdError = MissingRowIdError;
function useGridParamsApi(apiRef, props) {
  const getColumnHeaderParams = React.useCallback(field => ({
    field,
    colDef: apiRef.current.getColumn(field)
  }), [apiRef]);
  const getRowParams = React.useCallback(id => {
    const row = apiRef.current.getRow(id);
    if (!row) {
      throw new MissingRowIdError(`No row with id #${id} found`);
    }
    const params = {
      id,
      columns: apiRef.current.getAllColumns(),
      row
    };
    return params;
  }, [apiRef]);
  const getCellParamsForRow = React.useCallback((id, field, row, {
    cellMode,
    colDef,
    hasFocus,
    rowNode,
    tabIndex
  }) => {
    const rawValue = row[field];
    const value = colDef?.valueGetter ? colDef.valueGetter(rawValue, row, colDef, apiRef) : rawValue;
    const params = {
      id,
      field,
      row,
      rowNode,
      colDef,
      cellMode,
      hasFocus,
      tabIndex,
      value,
      formattedValue: value,
      isEditable: false,
      api: apiRef.current
    };
    if (colDef && colDef.valueFormatter) {
      params.formattedValue = colDef.valueFormatter(value, row, colDef, apiRef);
    }
    params.isEditable = colDef && apiRef.current.isCellEditable(params);
    return params;
  }, [apiRef]);
  const getCellParams = React.useCallback((id, field) => {
    const row = apiRef.current.getRow(id);
    const rowNode = (0, _gridRowsSelector.gridRowNodeSelector)(apiRef, id);
    if (!row || !rowNode) {
      throw new MissingRowIdError(`No row with id #${id} found`);
    }
    const cellFocus = (0, _gridFocusStateSelector.gridFocusCellSelector)(apiRef);
    const cellTabIndex = (0, _gridFocusStateSelector.gridTabIndexCellSelector)(apiRef);
    const cellMode = apiRef.current.getCellMode(id, field);
    return apiRef.current.getCellParamsForRow(id, field, row, {
      colDef: props.listView && props.listViewColumn?.field === field ? (0, _gridListViewSelectors.gridListColumnSelector)(apiRef) : apiRef.current.getColumn(field),
      rowNode,
      hasFocus: cellFocus !== null && cellFocus.field === field && cellFocus.id === id,
      tabIndex: cellTabIndex && cellTabIndex.field === field && cellTabIndex.id === id ? 0 : -1,
      cellMode
    });
  }, [apiRef, props.listView, props.listViewColumn?.field]);
  const getCellValue = React.useCallback((id, field) => {
    const colDef = apiRef.current.getColumn(field);
    const row = apiRef.current.getRow(id);
    if (!row) {
      throw new MissingRowIdError(`No row with id #${id} found`);
    }
    if (!colDef || !colDef.valueGetter) {
      return row[field];
    }
    return colDef.valueGetter(row[colDef.field], row, colDef, apiRef);
  }, [apiRef]);
  const getRowValue = React.useCallback((row, colDef) => (0, _gridRowsUtils.getRowValue)(row, colDef, apiRef), [apiRef]);
  const getRowFormattedValue = React.useCallback((row, colDef) => {
    const value = getRowValue(row, colDef);
    if (!colDef || !colDef.valueFormatter) {
      return value;
    }
    return colDef.valueFormatter(value, row, colDef, apiRef);
  }, [apiRef, getRowValue]);
  const getColumnHeaderElement = React.useCallback(field => {
    if (!apiRef.current.rootElementRef.current) {
      return null;
    }
    return (0, _domUtils.getGridColumnHeaderElement)(apiRef.current.rootElementRef.current, field);
  }, [apiRef]);
  const getRowElement = React.useCallback(id => {
    if (!apiRef.current.rootElementRef.current) {
      return null;
    }
    return (0, _domUtils.getGridRowElement)(apiRef.current.rootElementRef.current, id);
  }, [apiRef]);
  const getCellElement = React.useCallback((id, field) => {
    if (!apiRef.current.rootElementRef.current) {
      return null;
    }
    return (0, _domUtils.getGridCellElement)(apiRef.current.rootElementRef.current, {
      id,
      field
    });
  }, [apiRef]);
  const paramsApi = {
    getCellValue,
    getCellParams,
    getCellElement,
    getRowValue,
    getRowFormattedValue,
    getRowParams,
    getRowElement,
    getColumnHeaderParams,
    getColumnHeaderElement
  };
  const paramsPrivateApi = {
    getCellParamsForRow
  };
  (0, _useGridApiMethod.useGridApiMethod)(apiRef, paramsApi, 'public');
  (0, _useGridApiMethod.useGridApiMethod)(apiRef, paramsPrivateApi, 'private');
}
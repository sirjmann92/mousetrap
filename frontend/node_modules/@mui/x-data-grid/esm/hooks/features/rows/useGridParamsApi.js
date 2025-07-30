import * as React from 'react';
import { getGridCellElement, getGridColumnHeaderElement, getGridRowElement } from "../../../utils/domUtils.js";
import { useGridApiMethod } from "../../utils/useGridApiMethod.js";
import { gridFocusCellSelector, gridTabIndexCellSelector } from "../focus/gridFocusStateSelector.js";
import { gridListColumnSelector } from "../listView/gridListViewSelectors.js";
import { gridRowNodeSelector } from "./gridRowsSelector.js";
import { getRowValue as getRowValueFn } from "./gridRowsUtils.js";
export class MissingRowIdError extends Error {}

/**
 * @requires useGridColumns (method)
 * @requires useGridRows (method)
 * @requires useGridFocus (state)
 * @requires useGridEditing (method)
 * TODO: Impossible priority - useGridEditing also needs to be after useGridParamsApi
 * TODO: Impossible priority - useGridFocus also needs to be after useGridParamsApi
 */
export function useGridParamsApi(apiRef, props) {
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
    const rowNode = gridRowNodeSelector(apiRef, id);
    if (!row || !rowNode) {
      throw new MissingRowIdError(`No row with id #${id} found`);
    }
    const cellFocus = gridFocusCellSelector(apiRef);
    const cellTabIndex = gridTabIndexCellSelector(apiRef);
    const cellMode = apiRef.current.getCellMode(id, field);
    return apiRef.current.getCellParamsForRow(id, field, row, {
      colDef: props.listView && props.listViewColumn?.field === field ? gridListColumnSelector(apiRef) : apiRef.current.getColumn(field),
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
  const getRowValue = React.useCallback((row, colDef) => getRowValueFn(row, colDef, apiRef), [apiRef]);
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
    return getGridColumnHeaderElement(apiRef.current.rootElementRef.current, field);
  }, [apiRef]);
  const getRowElement = React.useCallback(id => {
    if (!apiRef.current.rootElementRef.current) {
      return null;
    }
    return getGridRowElement(apiRef.current.rootElementRef.current, id);
  }, [apiRef]);
  const getCellElement = React.useCallback((id, field) => {
    if (!apiRef.current.rootElementRef.current) {
      return null;
    }
    return getGridCellElement(apiRef.current.rootElementRef.current, {
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
  useGridApiMethod(apiRef, paramsApi, 'public');
  useGridApiMethod(apiRef, paramsPrivateApi, 'private');
}
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridFocusedVirtualCellSelector = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _createSelector = require("../../../utils/createSelector");
var _gridColumnsSelector = require("../columns/gridColumnsSelector");
var _gridVirtualizationSelectors = require("./gridVirtualizationSelectors");
var _focus = require("../focus");
var _pagination = require("../pagination");
const gridIsFocusedCellOutOfContext = (0, _createSelector.createSelector)(_focus.gridFocusCellSelector, _gridVirtualizationSelectors.gridRenderContextSelector, _pagination.gridVisibleRowsSelector, _gridColumnsSelector.gridVisibleColumnDefinitionsSelector, (focusedCell, renderContext, currentPage, visibleColumns) => {
  if (!focusedCell) {
    return false;
  }
  const rowIndex = currentPage.rowIdToIndexMap.get(focusedCell.id);
  const columnIndex = visibleColumns.slice(renderContext.firstColumnIndex, renderContext.lastColumnIndex).findIndex(column => column.field === focusedCell.field);
  const isInRenderContext = rowIndex !== undefined && columnIndex !== -1 && rowIndex >= renderContext.firstRowIndex && rowIndex <= renderContext.lastRowIndex;
  return !isInRenderContext;
});
const gridFocusedVirtualCellSelector = exports.gridFocusedVirtualCellSelector = (0, _createSelector.createSelectorMemoized)(gridIsFocusedCellOutOfContext, _gridColumnsSelector.gridVisibleColumnDefinitionsSelector, _pagination.gridVisibleRowsSelector, _focus.gridFocusCellSelector, (isFocusedCellOutOfRenderContext, visibleColumns, currentPage, focusedCell) => {
  if (!isFocusedCellOutOfRenderContext) {
    return null;
  }
  const rowIndex = currentPage.rowIdToIndexMap.get(focusedCell.id);
  if (rowIndex === undefined) {
    return null;
  }
  const columnIndex = visibleColumns.findIndex(column => column.field === focusedCell.field);
  if (columnIndex === -1) {
    return null;
  }
  return (0, _extends2.default)({}, focusedCell, {
    rowIndex,
    columnIndex
  });
});
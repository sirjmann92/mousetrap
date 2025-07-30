"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridVisibleRows = exports.getVisibleRows = void 0;
var _gridPaginationSelector = require("../features/pagination/gridPaginationSelector");
var _ = require(".");
const getVisibleRows = (apiRef, props) => {
  return (0, _gridPaginationSelector.gridVisibleRowsSelector)(apiRef);
};

/**
 * Computes the list of rows that are reachable by scroll.
 * Depending on whether pagination is enabled, it will return the rows in the current page.
 * - If the pagination is disabled or in server mode, it equals all the visible rows.
 * - If the row tree has several layers, it contains up to `state.pageSize` top level rows and all their descendants.
 * - If the row tree is flat, it only contains up to `state.pageSize` rows.
 */
exports.getVisibleRows = getVisibleRows;
const useGridVisibleRows = (apiRef, props) => {
  return (0, _.useGridSelector)(apiRef, _gridPaginationSelector.gridVisibleRowsSelector);
};
exports.useGridVisibleRows = useGridVisibleRows;
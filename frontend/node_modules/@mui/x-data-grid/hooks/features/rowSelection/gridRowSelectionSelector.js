"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridRowSelectionStateSelector = exports.gridRowSelectionManagerSelector = exports.gridRowSelectionIdsSelector = exports.gridRowSelectionCountSelector = void 0;
var _createSelector = require("../../../utils/createSelector");
var _gridRowsSelector = require("../rows/gridRowsSelector");
var _gridFilterSelector = require("../filter/gridFilterSelector");
var _gridRowSelectionManager = require("../../../models/gridRowSelectionManager");
const gridRowSelectionStateSelector = exports.gridRowSelectionStateSelector = (0, _createSelector.createRootSelector)(state => state.rowSelection);
const gridRowSelectionManagerSelector = exports.gridRowSelectionManagerSelector = (0, _createSelector.createSelectorMemoized)(gridRowSelectionStateSelector, _gridRowSelectionManager.createRowSelectionManager);
const gridRowSelectionCountSelector = exports.gridRowSelectionCountSelector = (0, _createSelector.createSelector)(gridRowSelectionStateSelector, _gridFilterSelector.gridFilteredRowCountSelector, (selection, filteredRowCount) => {
  if (selection.type === 'include') {
    return selection.ids.size;
  }
  // In exclude selection, all rows are selectable.
  return filteredRowCount - selection.ids.size;
});
const gridRowSelectionIdsSelector = exports.gridRowSelectionIdsSelector = (0, _createSelector.createSelectorMemoized)(gridRowSelectionStateSelector, _gridRowsSelector.gridRowsLookupSelector, _gridRowsSelector.gridDataRowIdsSelector, (selectionModel, rowsLookup, rowIds) => {
  const map = new Map();
  if (selectionModel.type === 'include') {
    for (const id of selectionModel.ids) {
      map.set(id, rowsLookup[id]);
    }
  } else {
    for (let i = 0; i < rowIds.length; i += 1) {
      const id = rowIds[i];
      if (!selectionModel.ids.has(id)) {
        map.set(id, rowsLookup[id]);
      }
    }
  }
  return map;
});
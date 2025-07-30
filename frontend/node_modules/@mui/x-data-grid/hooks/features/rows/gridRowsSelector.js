"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridTopLevelRowCountSelector = exports.gridRowsStateSelector = exports.gridRowsLookupSelector = exports.gridRowsLoadingSelector = exports.gridRowTreeSelector = exports.gridRowTreeDepthsSelector = exports.gridRowSelector = exports.gridRowNodeSelector = exports.gridRowMaximumTreeDepthSelector = exports.gridRowGroupsToFetchSelector = exports.gridRowGroupingNameSelector = exports.gridRowCountSelector = exports.gridPinnedRowsSelector = exports.gridPinnedRowsCountSelector = exports.gridDataRowsSelector = exports.gridDataRowIdsSelector = exports.gridAdditionalRowGroupsSelector = void 0;
var _createSelector = require("../../../utils/createSelector");
const gridRowsStateSelector = exports.gridRowsStateSelector = (0, _createSelector.createRootSelector)(state => state.rows);
const gridRowCountSelector = exports.gridRowCountSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.totalRowCount);
const gridRowsLoadingSelector = exports.gridRowsLoadingSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.loading);
const gridTopLevelRowCountSelector = exports.gridTopLevelRowCountSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.totalTopLevelRowCount);

// TODO rows v6: Rename
const gridRowsLookupSelector = exports.gridRowsLookupSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.dataRowIdToModelLookup);
const gridRowSelector = exports.gridRowSelector = (0, _createSelector.createSelector)(gridRowsLookupSelector, (rows, id) => rows[id]);
const gridRowTreeSelector = exports.gridRowTreeSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.tree);
const gridRowNodeSelector = exports.gridRowNodeSelector = (0, _createSelector.createSelector)(gridRowTreeSelector, (rowTree, rowId) => rowTree[rowId]);
const gridRowGroupsToFetchSelector = exports.gridRowGroupsToFetchSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.groupsToFetch);
const gridRowGroupingNameSelector = exports.gridRowGroupingNameSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.groupingName);
const gridRowTreeDepthsSelector = exports.gridRowTreeDepthsSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.treeDepths);
const gridRowMaximumTreeDepthSelector = exports.gridRowMaximumTreeDepthSelector = (0, _createSelector.createSelectorMemoized)(gridRowsStateSelector, rows => {
  const entries = Object.entries(rows.treeDepths);
  if (entries.length === 0) {
    return 1;
  }
  return (entries.filter(([, nodeCount]) => nodeCount > 0).map(([depth]) => Number(depth)).sort((a, b) => b - a)[0] ?? 0) + 1;
});
const gridDataRowIdsSelector = exports.gridDataRowIdsSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows.dataRowIds);
const gridDataRowsSelector = exports.gridDataRowsSelector = (0, _createSelector.createSelectorMemoized)(gridDataRowIdsSelector, gridRowsLookupSelector, (dataRowIds, rowsLookup) => dataRowIds.reduce((acc, id) => {
  if (!rowsLookup[id]) {
    return acc;
  }
  acc.push(rowsLookup[id]);
  return acc;
}, []));

/**
 * @ignore - do not document.
 */
const gridAdditionalRowGroupsSelector = exports.gridAdditionalRowGroupsSelector = (0, _createSelector.createSelector)(gridRowsStateSelector, rows => rows?.additionalRowGroups);

/**
 * @ignore - do not document.
 */
const gridPinnedRowsSelector = exports.gridPinnedRowsSelector = (0, _createSelector.createSelectorMemoized)(gridAdditionalRowGroupsSelector, additionalRowGroups => {
  const rawPinnedRows = additionalRowGroups?.pinnedRows;
  return {
    bottom: rawPinnedRows?.bottom?.map(rowEntry => ({
      id: rowEntry.id,
      model: rowEntry.model ?? {}
    })) ?? [],
    top: rawPinnedRows?.top?.map(rowEntry => ({
      id: rowEntry.id,
      model: rowEntry.model ?? {}
    })) ?? []
  };
});

/**
 * @ignore - do not document.
 */
const gridPinnedRowsCountSelector = exports.gridPinnedRowsCountSelector = (0, _createSelector.createSelector)(gridPinnedRowsSelector, pinnedRows => {
  return (pinnedRows?.top?.length || 0) + (pinnedRows?.bottom?.length || 0);
});
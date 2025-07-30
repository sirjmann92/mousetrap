"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridRowIsEditingSelector = exports.gridEditRowsStateSelector = exports.gridEditCellStateSelector = void 0;
var _createSelector = require("../../../utils/createSelector");
var _gridEditRowModel = require("../../../models/gridEditRowModel");
/**
 * Select the row editing state.
 */
const gridEditRowsStateSelector = exports.gridEditRowsStateSelector = (0, _createSelector.createRootSelector)(state => state.editRows);
const gridRowIsEditingSelector = exports.gridRowIsEditingSelector = (0, _createSelector.createSelector)(gridEditRowsStateSelector, (editRows, {
  rowId,
  editMode
}) => editMode === _gridEditRowModel.GridEditModes.Row && Boolean(editRows[rowId]));
const gridEditCellStateSelector = exports.gridEditCellStateSelector = (0, _createSelector.createSelector)(gridEditRowsStateSelector, (editRows, {
  rowId,
  field
}) => editRows[rowId]?.[field] ?? null);
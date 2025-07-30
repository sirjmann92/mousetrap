"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridListViewSelector = exports.gridListColumnSelector = void 0;
var _createSelector = require("../../../utils/createSelector");
/**
 * Get the list view state
 * @category List View
 * @ignore - Do not document
 */
const gridListViewSelector = exports.gridListViewSelector = (0, _createSelector.createRootSelector)(state => state.props.listView ?? false);

/**
 * Get the list column definition
 * @category List View
 * @ignore - Do not document
 */
const gridListColumnSelector = exports.gridListColumnSelector = (0, _createSelector.createRootSelector)(state => state.listViewColumn);
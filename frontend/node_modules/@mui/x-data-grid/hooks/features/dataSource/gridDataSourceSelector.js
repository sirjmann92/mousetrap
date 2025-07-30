"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridGetRowsParamsSelector = void 0;
var _gridFilterSelector = require("../filter/gridFilterSelector");
var _gridSortingSelector = require("../sorting/gridSortingSelector");
var _gridPaginationSelector = require("../pagination/gridPaginationSelector");
var _createSelector = require("../../../utils/createSelector");
const gridGetRowsParamsSelector = exports.gridGetRowsParamsSelector = (0, _createSelector.createSelector)(_gridFilterSelector.gridFilterModelSelector, _gridSortingSelector.gridSortModelSelector, _gridPaginationSelector.gridPaginationModelSelector, (filterModel, sortModel, paginationModel) => ({
  groupKeys: [],
  paginationModel,
  sortModel,
  filterModel,
  start: paginationModel.page * paginationModel.pageSize,
  end: paginationModel.page * paginationModel.pageSize + paginationModel.pageSize - 1
}));
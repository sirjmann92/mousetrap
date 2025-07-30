"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultGridFilterModel = exports.defaultGridFilterLookup = void 0;
var _gridFilterItem = require("../../../models/gridFilterItem");
const defaultGridFilterLookup = exports.defaultGridFilterLookup = {
  filteredRowsLookup: {},
  filteredChildrenCountLookup: {},
  filteredDescendantCountLookup: {}
};
const getDefaultGridFilterModel = () => ({
  items: [],
  logicOperator: _gridFilterItem.GridLogicOperator.And,
  quickFilterValues: [],
  quickFilterLogicOperator: _gridFilterItem.GridLogicOperator.And
});

/**
 * @param {GridValidRowModel} row The model of the row we want to filter.
 * @param {(filterItem: GridFilterItem) => boolean} shouldApplyItem An optional callback to allow the filtering engine to only apply some items.
 * @param {GridAggregatedFilterItemApplierResult} result The previous result of the filtering engine.
 */

/**
 * Visibility status for each row.
 * A row is visible if it is passing the filters AND if its parents are expanded.
 * If a row is not registered in this lookup, it is visible.
 */
exports.getDefaultGridFilterModel = getDefaultGridFilterModel;
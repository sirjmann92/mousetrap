"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isGroupingColumn = exports.getRowGroupingCriteriaFromGroupingField = void 0;
var _constants = require("../constants");
const getRowGroupingCriteriaFromGroupingField = groupingColDefField => {
  const match = groupingColDefField.match(/^__row_group_by_columns_group_(.*)__$/);
  if (!match) {
    return null;
  }
  return match[1];
};
exports.getRowGroupingCriteriaFromGroupingField = getRowGroupingCriteriaFromGroupingField;
const isGroupingColumn = field => field === _constants.GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD || getRowGroupingCriteriaFromGroupingField(field) !== null;
exports.isGroupingColumn = isGroupingColumn;
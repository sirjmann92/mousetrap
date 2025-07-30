"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PinnedColumnPosition = exports.GRID_TREE_DATA_GROUPING_FIELD = exports.GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD = exports.GRID_DETAIL_PANEL_TOGGLE_FIELD = void 0;
const GRID_TREE_DATA_GROUPING_FIELD = exports.GRID_TREE_DATA_GROUPING_FIELD = '__tree_data_group__';
const GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD = exports.GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD = '__row_group_by_columns_group__';
const GRID_DETAIL_PANEL_TOGGLE_FIELD = exports.GRID_DETAIL_PANEL_TOGGLE_FIELD = '__detail_panel_toggle__';
let PinnedColumnPosition = exports.PinnedColumnPosition = /*#__PURE__*/function (PinnedColumnPosition) {
  PinnedColumnPosition[PinnedColumnPosition["NONE"] = 0] = "NONE";
  PinnedColumnPosition[PinnedColumnPosition["LEFT"] = 1] = "LEFT";
  PinnedColumnPosition[PinnedColumnPosition["RIGHT"] = 2] = "RIGHT";
  PinnedColumnPosition[PinnedColumnPosition["VIRTUAL"] = 3] = "VIRTUAL";
  return PinnedColumnPosition;
}({});
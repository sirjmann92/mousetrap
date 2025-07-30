"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridResizingColumnFieldSelector = exports.gridColumnResizeSelector = void 0;
var _createSelector = require("../../../utils/createSelector");
const gridColumnResizeSelector = exports.gridColumnResizeSelector = (0, _createSelector.createRootSelector)(state => state.columnResize);
const gridResizingColumnFieldSelector = exports.gridResizingColumnFieldSelector = (0, _createSelector.createSelector)(gridColumnResizeSelector, columnResize => columnResize.resizingColumnField);
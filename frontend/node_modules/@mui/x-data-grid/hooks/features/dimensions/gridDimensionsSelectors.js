"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridVerticalScrollbarWidthSelector = exports.gridRowHeightSelector = exports.gridHorizontalScrollbarHeightSelector = exports.gridHeaderHeightSelector = exports.gridHeaderFilterHeightSelector = exports.gridHasScrollYSelector = exports.gridHasScrollXSelector = exports.gridHasFillerSelector = exports.gridHasBottomFillerSelector = exports.gridGroupHeaderHeightSelector = exports.gridDimensionsSelector = exports.gridContentHeightSelector = exports.gridColumnsTotalWidthSelector = void 0;
var _createSelector = require("../../../utils/createSelector");
const gridDimensionsSelector = exports.gridDimensionsSelector = (0, _createSelector.createRootSelector)(state => state.dimensions);

/**
 * Get the summed width of all the visible columns.
 * @category Visible Columns
 */
const gridColumnsTotalWidthSelector = exports.gridColumnsTotalWidthSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.columnsTotalWidth);
const gridRowHeightSelector = exports.gridRowHeightSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.rowHeight);
const gridContentHeightSelector = exports.gridContentHeightSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.contentSize.height);
const gridHasScrollXSelector = exports.gridHasScrollXSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.hasScrollX);
const gridHasScrollYSelector = exports.gridHasScrollYSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.hasScrollY);
const gridHasFillerSelector = exports.gridHasFillerSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.columnsTotalWidth < dimensions.viewportOuterSize.width);
const gridHeaderHeightSelector = exports.gridHeaderHeightSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.headerHeight);
const gridGroupHeaderHeightSelector = exports.gridGroupHeaderHeightSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.groupHeaderHeight);
const gridHeaderFilterHeightSelector = exports.gridHeaderFilterHeightSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.headerFilterHeight);
const gridHorizontalScrollbarHeightSelector = exports.gridHorizontalScrollbarHeightSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.hasScrollX ? dimensions.scrollbarSize : 0);
const gridVerticalScrollbarWidthSelector = exports.gridVerticalScrollbarWidthSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, dimensions => dimensions.hasScrollY ? dimensions.scrollbarSize : 0);
const gridHasBottomFillerSelector = exports.gridHasBottomFillerSelector = (0, _createSelector.createSelector)(gridDimensionsSelector, gridHorizontalScrollbarHeightSelector, (dimensions, height) => {
  const needsLastRowBorder = dimensions.viewportOuterSize.height - dimensions.minimumSize.height > 0;
  if (height === 0 && !needsLastRowBorder) {
    return false;
  }
  return true;
});
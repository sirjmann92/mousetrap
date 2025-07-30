"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridAriaAttributes = void 0;
var _gridColumnsSelector = require("../features/columns/gridColumnsSelector");
var _useGridSelector = require("./useGridSelector");
var _useGridRootProps = require("./useGridRootProps");
var _gridColumnGroupsSelector = require("../features/columnGrouping/gridColumnGroupsSelector");
var _gridRowsSelector = require("../features/rows/gridRowsSelector");
var _useGridPrivateApiContext = require("./useGridPrivateApiContext");
var _utils = require("../features/rowSelection/utils");
var _gridFilterSelector = require("../features/filter/gridFilterSelector");
const useGridAriaAttributes = () => {
  const apiRef = (0, _useGridPrivateApiContext.useGridPrivateApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const visibleColumns = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnsSelector.gridVisibleColumnDefinitionsSelector);
  const accessibleRowCount = (0, _useGridSelector.useGridSelector)(apiRef, _gridFilterSelector.gridExpandedRowCountSelector);
  const headerGroupingMaxDepth = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnGroupsSelector.gridColumnGroupsHeaderMaxDepthSelector);
  const pinnedRowsCount = (0, _useGridSelector.useGridSelector)(apiRef, _gridRowsSelector.gridPinnedRowsCountSelector);
  const ariaLabel = rootProps['aria-label'];
  const ariaLabelledby = rootProps['aria-labelledby'];
  // `aria-label` and `aria-labelledby` should take precedence over `label`
  const shouldUseLabelAsAriaLabel = !ariaLabel && !ariaLabelledby && rootProps.label;
  return {
    role: 'grid',
    'aria-label': shouldUseLabelAsAriaLabel ? rootProps.label : ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-colcount': visibleColumns.length,
    'aria-rowcount': headerGroupingMaxDepth + 1 + pinnedRowsCount + accessibleRowCount,
    'aria-multiselectable': (0, _utils.isMultipleRowSelectionEnabled)(rootProps)
  };
};
exports.useGridAriaAttributes = useGridAriaAttributes;
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridHeaders = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _fastMemo = require("@mui/x-internals/fastMemo");
var _useGridPrivateApiContext = require("../hooks/utils/useGridPrivateApiContext");
var _useGridSelector = require("../hooks/utils/useGridSelector");
var _useGridRootProps = require("../hooks/utils/useGridRootProps");
var _gridColumnsSelector = require("../hooks/features/columns/gridColumnsSelector");
var _gridFilterSelector = require("../hooks/features/filter/gridFilterSelector");
var _gridSortingSelector = require("../hooks/features/sorting/gridSortingSelector");
var _gridFocusStateSelector = require("../hooks/features/focus/gridFocusStateSelector");
var _gridColumnGroupsSelector = require("../hooks/features/columnGrouping/gridColumnGroupsSelector");
var _columnMenuSelector = require("../hooks/features/columnMenu/columnMenuSelector");
var _jsxRuntime = require("react/jsx-runtime");
function GridHeaders() {
  const apiRef = (0, _useGridPrivateApiContext.useGridPrivateApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const visibleColumns = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnsSelector.gridVisibleColumnDefinitionsSelector);
  const filterColumnLookup = (0, _useGridSelector.useGridSelector)(apiRef, _gridFilterSelector.gridFilterActiveItemsLookupSelector);
  const sortColumnLookup = (0, _useGridSelector.useGridSelector)(apiRef, _gridSortingSelector.gridSortColumnLookupSelector);
  const columnHeaderTabIndexState = (0, _useGridSelector.useGridSelector)(apiRef, _gridFocusStateSelector.gridTabIndexColumnHeaderSelector);
  const hasNoCellTabIndexState = (0, _useGridSelector.useGridSelector)(apiRef, () => (0, _gridFocusStateSelector.gridTabIndexCellSelector)(apiRef) === null);
  const columnGroupHeaderTabIndexState = (0, _useGridSelector.useGridSelector)(apiRef, _gridFocusStateSelector.gridTabIndexColumnGroupHeaderSelector);
  const columnHeaderFocus = (0, _useGridSelector.useGridSelector)(apiRef, _gridFocusStateSelector.gridFocusColumnHeaderSelector);
  const columnGroupHeaderFocus = (0, _useGridSelector.useGridSelector)(apiRef, _gridFocusStateSelector.gridFocusColumnGroupHeaderSelector);
  const headerGroupingMaxDepth = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnGroupsSelector.gridColumnGroupsHeaderMaxDepthSelector);
  const columnMenuState = (0, _useGridSelector.useGridSelector)(apiRef, _columnMenuSelector.gridColumnMenuSelector);
  const columnVisibility = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnsSelector.gridColumnVisibilityModelSelector);
  const columnGroupsHeaderStructure = (0, _useGridSelector.useGridSelector)(apiRef, _gridColumnGroupsSelector.gridColumnGroupsHeaderStructureSelector);
  const hasOtherElementInTabSequence = !(columnGroupHeaderTabIndexState === null && columnHeaderTabIndexState === null && hasNoCellTabIndexState);
  const columnsContainerRef = apiRef.current.columnHeadersContainerRef;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.columnHeaders, (0, _extends2.default)({
    ref: columnsContainerRef,
    visibleColumns: visibleColumns,
    filterColumnLookup: filterColumnLookup,
    sortColumnLookup: sortColumnLookup,
    columnHeaderTabIndexState: columnHeaderTabIndexState,
    columnGroupHeaderTabIndexState: columnGroupHeaderTabIndexState,
    columnHeaderFocus: columnHeaderFocus,
    columnGroupHeaderFocus: columnGroupHeaderFocus,
    headerGroupingMaxDepth: headerGroupingMaxDepth,
    columnMenuState: columnMenuState,
    columnVisibility: columnVisibility,
    columnGroupsHeaderStructure: columnGroupsHeaderStructure,
    hasOtherElementInTabSequence: hasOtherElementInTabSequence
  }, rootProps.slotProps?.columnHeaders));
}
const MemoizedGridHeaders = exports.GridHeaders = (0, _fastMemo.fastMemo)(GridHeaders);
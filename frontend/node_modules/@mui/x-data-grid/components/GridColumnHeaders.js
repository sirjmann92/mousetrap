"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridColumnHeaders = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _fastMemo = require("@mui/x-internals/fastMemo");
var _forwardRef = require("@mui/x-internals/forwardRef");
var _useGridColumnHeaders = require("../hooks/features/columnHeaders/useGridColumnHeaders");
var _GridBaseColumnHeaders = require("./columnHeaders/GridBaseColumnHeaders");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["className", "visibleColumns", "sortColumnLookup", "filterColumnLookup", "columnHeaderTabIndexState", "columnGroupHeaderTabIndexState", "columnHeaderFocus", "columnGroupHeaderFocus", "headerGroupingMaxDepth", "columnMenuState", "columnVisibility", "columnGroupsHeaderStructure", "hasOtherElementInTabSequence"];
const GridColumnHeaders = (0, _forwardRef.forwardRef)(function GridColumnHeaders(props, ref) {
  const {
      visibleColumns,
      sortColumnLookup,
      filterColumnLookup,
      columnHeaderTabIndexState,
      columnGroupHeaderTabIndexState,
      columnHeaderFocus,
      columnGroupHeaderFocus,
      headerGroupingMaxDepth,
      columnMenuState,
      columnVisibility,
      columnGroupsHeaderStructure,
      hasOtherElementInTabSequence
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const {
    getInnerProps,
    getColumnHeadersRow,
    getColumnGroupHeadersRows
  } = (0, _useGridColumnHeaders.useGridColumnHeaders)({
    visibleColumns,
    sortColumnLookup,
    filterColumnLookup,
    columnHeaderTabIndexState,
    columnGroupHeaderTabIndexState,
    columnHeaderFocus,
    columnGroupHeaderFocus,
    headerGroupingMaxDepth,
    columnMenuState,
    columnVisibility,
    columnGroupsHeaderStructure,
    hasOtherElementInTabSequence
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_GridBaseColumnHeaders.GridBaseColumnHeaders, (0, _extends2.default)({}, other, getInnerProps(), {
    ref: ref,
    children: [getColumnGroupHeadersRows(), getColumnHeadersRow()]
  }));
});
if (process.env.NODE_ENV !== "production") GridColumnHeaders.displayName = "GridColumnHeaders";
process.env.NODE_ENV !== "production" ? GridColumnHeaders.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  columnGroupHeaderFocus: _propTypes.default.shape({
    depth: _propTypes.default.number.isRequired,
    field: _propTypes.default.string.isRequired
  }),
  columnGroupHeaderTabIndexState: _propTypes.default.shape({
    depth: _propTypes.default.number.isRequired,
    field: _propTypes.default.string.isRequired
  }),
  columnGroupsHeaderStructure: _propTypes.default.arrayOf(_propTypes.default.arrayOf(_propTypes.default.shape({
    columnFields: _propTypes.default.arrayOf(_propTypes.default.string).isRequired,
    groupId: _propTypes.default.string
  }))).isRequired,
  columnHeaderFocus: _propTypes.default.shape({
    field: _propTypes.default.string.isRequired
  }),
  columnHeaderTabIndexState: _propTypes.default.shape({
    field: _propTypes.default.string.isRequired
  }),
  columnMenuState: _propTypes.default.shape({
    field: _propTypes.default.string,
    open: _propTypes.default.bool.isRequired
  }).isRequired,
  columnVisibility: _propTypes.default.object.isRequired,
  filterColumnLookup: _propTypes.default.object.isRequired,
  hasOtherElementInTabSequence: _propTypes.default.bool.isRequired,
  headerGroupingMaxDepth: _propTypes.default.number.isRequired,
  sortColumnLookup: _propTypes.default.object.isRequired,
  visibleColumns: _propTypes.default.arrayOf(_propTypes.default.object).isRequired
} : void 0;
const MemoizedGridColumnHeaders = exports.GridColumnHeaders = (0, _fastMemo.fastMemo)(GridColumnHeaders);
"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GridHeaderCheckbox = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _forwardRef = require("@mui/x-internals/forwardRef");
var _utils = require("../../hooks/features/rowSelection/utils");
var _useGridSelector = require("../../hooks/utils/useGridSelector");
var _gridFocusStateSelector = require("../../hooks/features/focus/gridFocusStateSelector");
var _gridRowSelectionSelector = require("../../hooks/features/rowSelection/gridRowSelectionSelector");
var _useGridApiContext = require("../../hooks/utils/useGridApiContext");
var _gridClasses = require("../../constants/gridClasses");
var _useGridRootProps = require("../../hooks/utils/useGridRootProps");
var _gridFilterSelector = require("../../hooks/features/filter/gridFilterSelector");
var _gridPaginationSelector = require("../../hooks/features/pagination/gridPaginationSelector");
var _gridRowSelectionManager = require("../../models/gridRowSelectionManager");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["field", "colDef"];
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['checkboxInput']
  };
  return (0, _composeClasses.default)(slots, _gridClasses.getDataGridUtilityClass, classes);
};
const GridHeaderCheckbox = exports.GridHeaderCheckbox = (0, _forwardRef.forwardRef)(function GridHeaderCheckbox(props, ref) {
  const other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const [, forceUpdate] = React.useState(false);
  const apiRef = (0, _useGridApiContext.useGridApiContext)();
  const rootProps = (0, _useGridRootProps.useGridRootProps)();
  const ownerState = {
    classes: rootProps.classes
  };
  const classes = useUtilityClasses(ownerState);
  const tabIndexState = (0, _useGridSelector.useGridSelector)(apiRef, _gridFocusStateSelector.gridTabIndexColumnHeaderSelector);
  const selection = (0, _useGridSelector.useGridSelector)(apiRef, _gridRowSelectionSelector.gridRowSelectionStateSelector);
  const visibleRowIds = (0, _useGridSelector.useGridSelector)(apiRef, _gridFilterSelector.gridExpandedSortedRowIdsSelector);
  const paginatedVisibleRowIds = (0, _useGridSelector.useGridSelector)(apiRef, _gridPaginationSelector.gridPaginatedVisibleSortedGridRowIdsSelector);
  const filteredSelection = React.useMemo(() => {
    const isRowSelectable = rootProps.isRowSelectable;
    if (typeof isRowSelectable !== 'function') {
      return selection;
    }
    if (selection.type === 'exclude') {
      return selection;
    }

    // selection.type === 'include'
    const selectionModel = {
      type: 'include',
      ids: new Set()
    };
    for (const id of selection.ids) {
      if (rootProps.keepNonExistentRowsSelected) {
        selectionModel.ids.add(id);
      }
      // The row might have been deleted
      if (!apiRef.current.getRow(id)) {
        continue;
      }
      if (isRowSelectable(apiRef.current.getRowParams(id))) {
        selectionModel.ids.add(id);
      }
    }
    return selectionModel;
  }, [apiRef, rootProps.isRowSelectable, rootProps.keepNonExistentRowsSelected, selection]);

  // All the rows that could be selected / unselected by toggling this checkbox
  const selectionCandidates = React.useMemo(() => {
    const rowIds = !rootProps.pagination || !rootProps.checkboxSelectionVisibleOnly || rootProps.paginationMode === 'server' ? visibleRowIds : paginatedVisibleRowIds;

    // Convert to a Set to make O(1) checking if a row exists or not
    const candidates = new Set();
    for (let i = 0; i < rowIds.length; i += 1) {
      const id = rowIds[i];
      if (!apiRef.current.getRow(id)) {
        // The row could have been removed
        continue;
      }
      if (apiRef.current.isRowSelectable(id)) {
        candidates.add(id);
      }
    }
    return candidates;
  }, [apiRef, rootProps.pagination, rootProps.paginationMode, rootProps.checkboxSelectionVisibleOnly, paginatedVisibleRowIds, visibleRowIds]);

  // Amount of rows selected and that are visible in the current page
  const currentSelectionSize = React.useMemo(() => {
    const selectionManager = (0, _gridRowSelectionManager.createRowSelectionManager)(filteredSelection);
    let size = 0;
    for (const id of selectionCandidates) {
      if (selectionManager.has(id)) {
        size += 1;
      }
    }
    return size;
  }, [filteredSelection, selectionCandidates]);
  const isIndeterminate = React.useMemo(() => {
    if (filteredSelection.ids.size === 0) {
      return false;
    }
    const selectionManager = (0, _gridRowSelectionManager.createRowSelectionManager)(filteredSelection);
    for (const rowId of selectionCandidates) {
      if (!selectionManager.has(rowId)) {
        return true;
      }
    }
    return false;
  }, [filteredSelection, selectionCandidates]);
  const isChecked = currentSelectionSize > 0;
  const handleChange = event => {
    const params = {
      value: event.target.checked
    };
    apiRef.current.publishEvent('headerSelectionCheckboxChange', params);
  };
  const tabIndex = tabIndexState !== null && tabIndexState.field === props.field ? 0 : -1;
  React.useLayoutEffect(() => {
    const element = apiRef.current.getColumnHeaderElement(props.field);
    if (tabIndex === 0 && element) {
      element.tabIndex = -1;
    }
  }, [tabIndex, apiRef, props.field]);
  const handleKeyDown = React.useCallback(event => {
    if (event.key === ' ') {
      // imperative toggle the checkbox because Space is disable by some preventDefault
      apiRef.current.publishEvent('headerSelectionCheckboxChange', {
        value: !isChecked
      });
    }
  }, [apiRef, isChecked]);
  const handleSelectionChange = React.useCallback(() => {
    forceUpdate(p => !p);
  }, []);
  React.useEffect(() => {
    return apiRef.current.subscribeEvent('rowSelectionChange', handleSelectionChange);
  }, [apiRef, handleSelectionChange]);
  const label = apiRef.current.getLocaleText(isChecked && !isIndeterminate ? 'checkboxSelectionUnselectAllRows' : 'checkboxSelectionSelectAllRows');
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(rootProps.slots.baseCheckbox, (0, _extends2.default)({
    indeterminate: isIndeterminate,
    checked: isChecked && !isIndeterminate,
    onChange: handleChange,
    className: classes.root,
    slotProps: {
      htmlInput: {
        'aria-label': label,
        name: 'select_all_rows'
      }
    },
    tabIndex: tabIndex,
    onKeyDown: handleKeyDown,
    disabled: !(0, _utils.isMultipleRowSelectionEnabled)(rootProps)
  }, rootProps.slotProps?.baseCheckbox, other, {
    ref: ref
  }));
});
if (process.env.NODE_ENV !== "production") GridHeaderCheckbox.displayName = "GridHeaderCheckbox";
process.env.NODE_ENV !== "production" ? GridHeaderCheckbox.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The column of the current header component.
   */
  colDef: _propTypes.default.object.isRequired,
  /**
   * The column field of the column that triggered the event
   */
  field: _propTypes.default.string.isRequired
} : void 0;
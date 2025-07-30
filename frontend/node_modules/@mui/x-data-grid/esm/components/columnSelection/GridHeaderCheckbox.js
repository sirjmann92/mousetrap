'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["field", "colDef"];
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { isMultipleRowSelectionEnabled } from "../../hooks/features/rowSelection/utils.js";
import { useGridSelector } from "../../hooks/utils/useGridSelector.js";
import { gridTabIndexColumnHeaderSelector } from "../../hooks/features/focus/gridFocusStateSelector.js";
import { gridRowSelectionStateSelector } from "../../hooks/features/rowSelection/gridRowSelectionSelector.js";
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { getDataGridUtilityClass } from "../../constants/gridClasses.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { gridExpandedSortedRowIdsSelector } from "../../hooks/features/filter/gridFilterSelector.js";
import { gridPaginatedVisibleSortedGridRowIdsSelector } from "../../hooks/features/pagination/gridPaginationSelector.js";
import { createRowSelectionManager } from "../../models/gridRowSelectionManager.js";
import { jsx as _jsx } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['checkboxInput']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridHeaderCheckbox = forwardRef(function GridHeaderCheckbox(props, ref) {
  const other = _objectWithoutPropertiesLoose(props, _excluded);
  const [, forceUpdate] = React.useState(false);
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const ownerState = {
    classes: rootProps.classes
  };
  const classes = useUtilityClasses(ownerState);
  const tabIndexState = useGridSelector(apiRef, gridTabIndexColumnHeaderSelector);
  const selection = useGridSelector(apiRef, gridRowSelectionStateSelector);
  const visibleRowIds = useGridSelector(apiRef, gridExpandedSortedRowIdsSelector);
  const paginatedVisibleRowIds = useGridSelector(apiRef, gridPaginatedVisibleSortedGridRowIdsSelector);
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
    const selectionManager = createRowSelectionManager(filteredSelection);
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
    const selectionManager = createRowSelectionManager(filteredSelection);
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
  return /*#__PURE__*/_jsx(rootProps.slots.baseCheckbox, _extends({
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
    disabled: !isMultipleRowSelectionEnabled(rootProps)
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
  colDef: PropTypes.object.isRequired,
  /**
   * The column field of the column that triggered the event
   */
  field: PropTypes.string.isRequired
} : void 0;
export { GridHeaderCheckbox };
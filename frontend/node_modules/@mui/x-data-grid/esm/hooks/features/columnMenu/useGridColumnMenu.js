import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useGridLogger, useGridApiMethod, useGridEvent } from "../../utils/index.js";
import { gridColumnMenuSelector } from "./columnMenuSelector.js";
import { gridColumnLookupSelector, gridColumnVisibilityModelSelector, gridColumnFieldsSelector } from "../columns/gridColumnsSelector.js";
export const columnMenuStateInitializer = state => _extends({}, state, {
  columnMenu: {
    open: false
  }
});

/**
 * @requires useGridColumnResize (event)
 * @requires useGridInfiniteLoader (event)
 */
export const useGridColumnMenu = apiRef => {
  const logger = useGridLogger(apiRef, 'useGridColumnMenu');

  /**
   * API METHODS
   */
  const showColumnMenu = React.useCallback(field => {
    const columnMenuState = gridColumnMenuSelector(apiRef);
    const newState = {
      open: true,
      field
    };
    const shouldUpdate = newState.open !== columnMenuState.open || newState.field !== columnMenuState.field;
    if (shouldUpdate) {
      apiRef.current.setState(state => {
        if (state.columnMenu.open && state.columnMenu.field === field) {
          return state;
        }
        logger.debug('Opening Column Menu');
        return _extends({}, state, {
          columnMenu: {
            open: true,
            field
          }
        });
      });
      apiRef.current.hidePreferences();
    }
  }, [apiRef, logger]);
  const hideColumnMenu = React.useCallback(() => {
    const columnMenuState = gridColumnMenuSelector(apiRef);
    if (columnMenuState.field) {
      const columnLookup = gridColumnLookupSelector(apiRef);
      const columnVisibilityModel = gridColumnVisibilityModelSelector(apiRef);
      const orderedFields = gridColumnFieldsSelector(apiRef);
      let fieldToFocus = columnMenuState.field;

      // If the column was removed from the grid, we need to find the closest visible field
      if (!columnLookup[fieldToFocus]) {
        fieldToFocus = orderedFields[0];
      }

      // If the field to focus is hidden, we need to find the closest visible field
      if (columnVisibilityModel[fieldToFocus] === false) {
        // contains visible column fields + the field that was just hidden
        const visibleOrderedFields = orderedFields.filter(field => {
          if (field === fieldToFocus) {
            return true;
          }
          return columnVisibilityModel[field] !== false;
        });
        const fieldIndex = visibleOrderedFields.indexOf(fieldToFocus);
        fieldToFocus = visibleOrderedFields[fieldIndex + 1] || visibleOrderedFields[fieldIndex - 1];
      }
      apiRef.current.setColumnHeaderFocus(fieldToFocus);
    }
    const newState = {
      open: false,
      field: undefined
    };
    const shouldUpdate = newState.open !== columnMenuState.open || newState.field !== columnMenuState.field;
    if (shouldUpdate) {
      apiRef.current.setState(state => {
        logger.debug('Hiding Column Menu');
        return _extends({}, state, {
          columnMenu: newState
        });
      });
    }
  }, [apiRef, logger]);
  const toggleColumnMenu = React.useCallback(field => {
    logger.debug('Toggle Column Menu');
    const columnMenu = gridColumnMenuSelector(apiRef);
    if (!columnMenu.open || columnMenu.field !== field) {
      showColumnMenu(field);
    } else {
      hideColumnMenu();
    }
  }, [apiRef, logger, showColumnMenu, hideColumnMenu]);
  const columnMenuApi = {
    showColumnMenu,
    hideColumnMenu,
    toggleColumnMenu
  };
  useGridApiMethod(apiRef, columnMenuApi, 'public');
  useGridEvent(apiRef, 'columnResizeStart', hideColumnMenu);
  useGridEvent(apiRef, 'virtualScrollerWheel', apiRef.current.hideColumnMenu);
  useGridEvent(apiRef, 'virtualScrollerTouchMove', apiRef.current.hideColumnMenu);
};
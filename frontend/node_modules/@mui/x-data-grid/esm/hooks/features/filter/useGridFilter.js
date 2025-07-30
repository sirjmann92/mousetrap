import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { lruMemoize } from '@mui/x-internals/lruMemoize';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { isDeepEqual } from '@mui/x-internals/isDeepEqual';
import { useLazyRef } from "../../utils/useLazyRef.js";
import { useGridEvent } from "../../utils/useGridEvent.js";
import { useGridApiMethod } from "../../utils/useGridApiMethod.js";
import { useGridLogger } from "../../utils/useGridLogger.js";
import { gridColumnLookupSelector } from "../columns/gridColumnsSelector.js";
import { GridPreferencePanelsValue } from "../preferencesPanel/gridPreferencePanelsValue.js";
import { defaultGridFilterLookup, getDefaultGridFilterModel } from "./gridFilterState.js";
import { gridFilterModelSelector } from "./gridFilterSelector.js";
import { useFirstRender } from "../../utils/useFirstRender.js";
import { gridRowsLookupSelector } from "../rows/index.js";
import { useGridRegisterPipeProcessor } from "../../core/pipeProcessing/index.js";
import { GRID_DEFAULT_STRATEGY, useGridRegisterStrategyProcessor } from "../../core/strategyProcessing/index.js";
import { buildAggregatedFilterApplier, sanitizeFilterModel, mergeStateWithFilterModel, cleanFilterItem, passFilterLogic, shouldQuickFilterExcludeHiddenColumns } from "./gridFilterUtils.js";
import { jsx as _jsx } from "react/jsx-runtime";
export const filterStateInitializer = (state, props, apiRef) => {
  const filterModel = props.filterModel ?? props.initialState?.filter?.filterModel ?? getDefaultGridFilterModel();
  return _extends({}, state, {
    filter: _extends({
      filterModel: sanitizeFilterModel(filterModel, props.disableMultipleColumnsFiltering, apiRef)
    }, defaultGridFilterLookup),
    visibleRowsLookup: {}
  });
};
const getVisibleRowsLookup = params => {
  // For flat tree, the `visibleRowsLookup` and the `filteredRowsLookup` are equals since no row is collapsed.
  return params.filteredRowsLookup;
};
function getVisibleRowsLookupState(apiRef, state) {
  return apiRef.current.applyStrategyProcessor('visibleRowsLookupCreation', {
    tree: state.rows.tree,
    filteredRowsLookup: state.filter.filteredRowsLookup
  });
}
function createMemoizedValues() {
  return lruMemoize(Object.values);
}

/**
 * @requires useGridColumns (method, event)
 * @requires useGridParamsApi (method)
 * @requires useGridRows (event)
 */
export const useGridFilter = (apiRef, props) => {
  const logger = useGridLogger(apiRef, 'useGridFilter');
  apiRef.current.registerControlState({
    stateId: 'filter',
    propModel: props.filterModel,
    propOnChange: props.onFilterModelChange,
    stateSelector: gridFilterModelSelector,
    changeEvent: 'filterModelChange'
  });
  const updateFilteredRows = React.useCallback(() => {
    apiRef.current.setState(state => {
      const filterModel = gridFilterModelSelector(apiRef);
      const filterState = apiRef.current.getFilterState(filterModel);
      const newState = _extends({}, state, {
        filter: _extends({}, state.filter, filterState)
      });
      const visibleRowsLookupState = getVisibleRowsLookupState(apiRef, newState);
      return _extends({}, newState, {
        visibleRowsLookup: visibleRowsLookupState
      });
    });
    apiRef.current.publishEvent('filteredRowsSet');
  }, [apiRef]);
  const addColumnMenuItem = React.useCallback((columnMenuItems, colDef) => {
    if (colDef == null || colDef.filterable === false || props.disableColumnFilter) {
      return columnMenuItems;
    }
    return [...columnMenuItems, 'columnMenuFilterItem'];
  }, [props.disableColumnFilter]);

  /**
   * API METHODS
   */
  const upsertFilterItem = React.useCallback(item => {
    const filterModel = gridFilterModelSelector(apiRef);
    const items = [...filterModel.items];
    const itemIndex = items.findIndex(filterItem => filterItem.id === item.id);
    if (itemIndex === -1) {
      items.push(item);
    } else {
      items[itemIndex] = item;
    }
    apiRef.current.setFilterModel(_extends({}, filterModel, {
      items
    }), 'upsertFilterItem');
  }, [apiRef]);
  const upsertFilterItems = React.useCallback(items => {
    const filterModel = gridFilterModelSelector(apiRef);
    const existingItems = [...filterModel.items];
    items.forEach(item => {
      const itemIndex = existingItems.findIndex(filterItem => filterItem.id === item.id);
      if (itemIndex === -1) {
        existingItems.push(item);
      } else {
        existingItems[itemIndex] = item;
      }
    });
    apiRef.current.setFilterModel(_extends({}, filterModel, {
      items: existingItems
    }), 'upsertFilterItems');
  }, [apiRef]);
  const deleteFilterItem = React.useCallback(itemToDelete => {
    const filterModel = gridFilterModelSelector(apiRef);
    const items = filterModel.items.filter(item => item.id !== itemToDelete.id);
    if (items.length === filterModel.items.length) {
      return;
    }
    apiRef.current.setFilterModel(_extends({}, filterModel, {
      items
    }), 'deleteFilterItem');
  }, [apiRef]);
  const showFilterPanel = React.useCallback((targetColumnField, panelId, labelId) => {
    logger.debug('Displaying filter panel');
    if (targetColumnField) {
      const filterModel = gridFilterModelSelector(apiRef);
      const filterItemsWithValue = filterModel.items.filter(item => {
        if (item.value !== undefined) {
          // Some filters like `isAnyOf` support array as `item.value`.
          // If array is empty, we want to remove it from the filter model.
          if (Array.isArray(item.value) && item.value.length === 0) {
            return false;
          }
          return true;
        }
        const column = apiRef.current.getColumn(item.field);
        const filterOperator = column.filterOperators?.find(operator => operator.value === item.operator);
        const requiresFilterValue = typeof filterOperator?.requiresFilterValue === 'undefined' ? true : filterOperator?.requiresFilterValue;

        // Operators like `isEmpty` don't have and don't require `item.value`.
        // So we don't want to remove them from the filter model if `item.value === undefined`.
        // See https://github.com/mui/mui-x/issues/5402
        if (requiresFilterValue) {
          return false;
        }
        return true;
      });
      let newFilterItems;
      const filterItemOnTarget = filterItemsWithValue.find(item => item.field === targetColumnField);
      const targetColumn = apiRef.current.getColumn(targetColumnField);
      if (filterItemOnTarget) {
        newFilterItems = filterItemsWithValue;
      } else if (props.disableMultipleColumnsFiltering) {
        newFilterItems = [cleanFilterItem({
          field: targetColumnField,
          operator: targetColumn.filterOperators[0].value
        }, apiRef)];
      } else {
        newFilterItems = [...filterItemsWithValue, cleanFilterItem({
          field: targetColumnField,
          operator: targetColumn.filterOperators[0].value
        }, apiRef)];
      }
      apiRef.current.setFilterModel(_extends({}, filterModel, {
        items: newFilterItems
      }));
    }
    apiRef.current.showPreferences(GridPreferencePanelsValue.filters, panelId, labelId);
  }, [apiRef, logger, props.disableMultipleColumnsFiltering]);
  const hideFilterPanel = React.useCallback(() => {
    logger.debug('Hiding filter panel');
    apiRef.current.hidePreferences();
  }, [apiRef, logger]);
  const setFilterLogicOperator = React.useCallback(logicOperator => {
    const filterModel = gridFilterModelSelector(apiRef);
    if (filterModel.logicOperator === logicOperator) {
      return;
    }
    apiRef.current.setFilterModel(_extends({}, filterModel, {
      logicOperator
    }), 'changeLogicOperator');
  }, [apiRef]);
  const setQuickFilterValues = React.useCallback(values => {
    const filterModel = gridFilterModelSelector(apiRef);
    if (isDeepEqual(filterModel.quickFilterValues, values)) {
      return;
    }
    apiRef.current.setFilterModel(_extends({}, filterModel, {
      quickFilterValues: [...values]
    }));
  }, [apiRef]);
  const setFilterModel = React.useCallback((model, reason) => {
    const currentModel = gridFilterModelSelector(apiRef);
    if (currentModel !== model) {
      logger.debug('Setting filter model');
      apiRef.current.updateControlState('filter', mergeStateWithFilterModel(model, props.disableMultipleColumnsFiltering, apiRef), reason);
      apiRef.current.unstable_applyFilters();
    }
  }, [apiRef, logger, props.disableMultipleColumnsFiltering]);
  const getFilterState = React.useCallback(inputFilterModel => {
    const filterModel = sanitizeFilterModel(inputFilterModel, props.disableMultipleColumnsFiltering, apiRef);
    const isRowMatchingFilters = props.filterMode === 'client' ? buildAggregatedFilterApplier(filterModel, apiRef, props.disableEval) : null;
    const filterResult = apiRef.current.applyStrategyProcessor('filtering', {
      isRowMatchingFilters,
      filterModel: filterModel ?? getDefaultGridFilterModel()
    });
    return _extends({}, filterResult, {
      filterModel
    });
  }, [props.disableMultipleColumnsFiltering, props.filterMode, props.disableEval, apiRef]);
  const filterApi = {
    setFilterLogicOperator,
    unstable_applyFilters: updateFilteredRows,
    deleteFilterItem,
    upsertFilterItem,
    upsertFilterItems,
    setFilterModel,
    showFilterPanel,
    hideFilterPanel,
    setQuickFilterValues,
    ignoreDiacritics: props.ignoreDiacritics,
    getFilterState
  };
  useGridApiMethod(apiRef, filterApi, 'public');

  /**
   * PRE-PROCESSING
   */
  const stateExportPreProcessing = React.useCallback((prevState, context) => {
    const filterModelToExport = gridFilterModelSelector(apiRef);

    // Remove the additional `fromInput` property from the filter model
    filterModelToExport.items.forEach(item => {
      delete item.fromInput;
    });
    const shouldExportFilterModel =
    // Always export if the `exportOnlyDirtyModels` property is not activated
    !context.exportOnlyDirtyModels ||
    // Always export if the model is controlled
    props.filterModel != null ||
    // Always export if the model has been initialized
    props.initialState?.filter?.filterModel != null ||
    // Export if the model is not equal to the default value
    !isDeepEqual(filterModelToExport, getDefaultGridFilterModel());
    if (!shouldExportFilterModel) {
      return prevState;
    }
    return _extends({}, prevState, {
      filter: {
        filterModel: filterModelToExport
      }
    });
  }, [apiRef, props.filterModel, props.initialState?.filter?.filterModel]);
  const stateRestorePreProcessing = React.useCallback((params, context) => {
    const filterModel = context.stateToRestore.filter?.filterModel;
    if (filterModel == null) {
      return params;
    }
    apiRef.current.updateControlState('filter', mergeStateWithFilterModel(filterModel, props.disableMultipleColumnsFiltering, apiRef), 'restoreState');
    return _extends({}, params, {
      callbacks: [...params.callbacks, apiRef.current.unstable_applyFilters]
    });
  }, [apiRef, props.disableMultipleColumnsFiltering]);
  const preferencePanelPreProcessing = React.useCallback((initialValue, value) => {
    if (value === GridPreferencePanelsValue.filters) {
      const FilterPanel = props.slots.filterPanel;
      return /*#__PURE__*/_jsx(FilterPanel, _extends({}, props.slotProps?.filterPanel));
    }
    return initialValue;
  }, [props.slots.filterPanel, props.slotProps?.filterPanel]);
  const {
    getRowId
  } = props;
  const getRowsRef = useLazyRef(createMemoizedValues);
  const flatFilteringMethod = React.useCallback(params => {
    if (props.filterMode !== 'client' || !params.isRowMatchingFilters || !params.filterModel.items.length && !params.filterModel.quickFilterValues?.length) {
      return defaultGridFilterLookup;
    }
    const dataRowIdToModelLookup = gridRowsLookupSelector(apiRef);
    const filteredRowsLookup = {};
    const {
      isRowMatchingFilters
    } = params;
    const filterCache = {};
    const result = {
      passingFilterItems: null,
      passingQuickFilterValues: null
    };
    const rows = getRowsRef.current(apiRef.current.state.rows.dataRowIdToModelLookup);
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const id = getRowId ? getRowId(row) : row.id;
      isRowMatchingFilters(row, undefined, result);
      const isRowPassing = passFilterLogic([result.passingFilterItems], [result.passingQuickFilterValues], params.filterModel, apiRef, filterCache);
      if (!isRowPassing) {
        filteredRowsLookup[id] = isRowPassing;
      }
    }
    const footerId = 'auto-generated-group-footer-root';
    const footer = dataRowIdToModelLookup[footerId];
    if (footer) {
      filteredRowsLookup[footerId] = true;
    }
    return {
      filteredRowsLookup,
      filteredChildrenCountLookup: {},
      filteredDescendantCountLookup: {}
    };
  }, [apiRef, props.filterMode, getRowId, getRowsRef]);
  useGridRegisterPipeProcessor(apiRef, 'columnMenu', addColumnMenuItem);
  useGridRegisterPipeProcessor(apiRef, 'exportState', stateExportPreProcessing);
  useGridRegisterPipeProcessor(apiRef, 'restoreState', stateRestorePreProcessing);
  useGridRegisterPipeProcessor(apiRef, 'preferencePanel', preferencePanelPreProcessing);
  useGridRegisterStrategyProcessor(apiRef, GRID_DEFAULT_STRATEGY, 'filtering', flatFilteringMethod);
  useGridRegisterStrategyProcessor(apiRef, GRID_DEFAULT_STRATEGY, 'visibleRowsLookupCreation', getVisibleRowsLookup);

  /**
   * EVENTS
   */
  const handleColumnsChange = React.useCallback(() => {
    logger.debug('onColUpdated - GridColumns changed, applying filters');
    const filterModel = gridFilterModelSelector(apiRef);
    const columnsLookup = gridColumnLookupSelector(apiRef);
    const newFilterItems = filterModel.items.filter(item => item.field && columnsLookup[item.field]);
    if (newFilterItems.length < filterModel.items.length) {
      apiRef.current.setFilterModel(_extends({}, filterModel, {
        items: newFilterItems
      }));
    }
  }, [apiRef, logger]);
  const handleStrategyProcessorChange = React.useCallback(methodName => {
    if (methodName === 'filtering') {
      apiRef.current.unstable_applyFilters();
    }
  }, [apiRef]);
  const updateVisibleRowsLookupState = React.useCallback(() => {
    apiRef.current.setState(state => {
      return _extends({}, state, {
        visibleRowsLookup: getVisibleRowsLookupState(apiRef, state)
      });
    });
  }, [apiRef]);
  useGridEvent(apiRef, 'rowsSet', updateFilteredRows);
  useGridEvent(apiRef, 'columnsChange', handleColumnsChange);
  useGridEvent(apiRef, 'activeStrategyProcessorChange', handleStrategyProcessorChange);
  useGridEvent(apiRef, 'rowExpansionChange', updateVisibleRowsLookupState);
  useGridEvent(apiRef, 'columnVisibilityModelChange', () => {
    const filterModel = gridFilterModelSelector(apiRef);
    if (filterModel.quickFilterValues?.length && shouldQuickFilterExcludeHiddenColumns(filterModel)) {
      // re-apply filters because the quick filter results may have changed
      updateFilteredRows();
    }
  });

  /**
   * 1ST RENDER
   */
  useFirstRender(() => {
    updateFilteredRows();
  });

  /**
   * EFFECTS
   */
  useEnhancedEffect(() => {
    if (props.filterModel !== undefined) {
      apiRef.current.setFilterModel(props.filterModel);
    }
  }, [apiRef, logger, props.filterModel]);
};
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridFilter = exports.filterStateInitializer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _lruMemoize = require("@mui/x-internals/lruMemoize");
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _isDeepEqual = require("@mui/x-internals/isDeepEqual");
var _useLazyRef = require("../../utils/useLazyRef");
var _useGridEvent = require("../../utils/useGridEvent");
var _useGridApiMethod = require("../../utils/useGridApiMethod");
var _useGridLogger = require("../../utils/useGridLogger");
var _gridColumnsSelector = require("../columns/gridColumnsSelector");
var _gridPreferencePanelsValue = require("../preferencesPanel/gridPreferencePanelsValue");
var _gridFilterState = require("./gridFilterState");
var _gridFilterSelector = require("./gridFilterSelector");
var _useFirstRender = require("../../utils/useFirstRender");
var _rows = require("../rows");
var _pipeProcessing = require("../../core/pipeProcessing");
var _strategyProcessing = require("../../core/strategyProcessing");
var _gridFilterUtils = require("./gridFilterUtils");
var _jsxRuntime = require("react/jsx-runtime");
const filterStateInitializer = (state, props, apiRef) => {
  const filterModel = props.filterModel ?? props.initialState?.filter?.filterModel ?? (0, _gridFilterState.getDefaultGridFilterModel)();
  return (0, _extends2.default)({}, state, {
    filter: (0, _extends2.default)({
      filterModel: (0, _gridFilterUtils.sanitizeFilterModel)(filterModel, props.disableMultipleColumnsFiltering, apiRef)
    }, _gridFilterState.defaultGridFilterLookup),
    visibleRowsLookup: {}
  });
};
exports.filterStateInitializer = filterStateInitializer;
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
  return (0, _lruMemoize.lruMemoize)(Object.values);
}

/**
 * @requires useGridColumns (method, event)
 * @requires useGridParamsApi (method)
 * @requires useGridRows (event)
 */
const useGridFilter = (apiRef, props) => {
  const logger = (0, _useGridLogger.useGridLogger)(apiRef, 'useGridFilter');
  apiRef.current.registerControlState({
    stateId: 'filter',
    propModel: props.filterModel,
    propOnChange: props.onFilterModelChange,
    stateSelector: _gridFilterSelector.gridFilterModelSelector,
    changeEvent: 'filterModelChange'
  });
  const updateFilteredRows = React.useCallback(() => {
    apiRef.current.setState(state => {
      const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
      const filterState = apiRef.current.getFilterState(filterModel);
      const newState = (0, _extends2.default)({}, state, {
        filter: (0, _extends2.default)({}, state.filter, filterState)
      });
      const visibleRowsLookupState = getVisibleRowsLookupState(apiRef, newState);
      return (0, _extends2.default)({}, newState, {
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
    const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
    const items = [...filterModel.items];
    const itemIndex = items.findIndex(filterItem => filterItem.id === item.id);
    if (itemIndex === -1) {
      items.push(item);
    } else {
      items[itemIndex] = item;
    }
    apiRef.current.setFilterModel((0, _extends2.default)({}, filterModel, {
      items
    }), 'upsertFilterItem');
  }, [apiRef]);
  const upsertFilterItems = React.useCallback(items => {
    const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
    const existingItems = [...filterModel.items];
    items.forEach(item => {
      const itemIndex = existingItems.findIndex(filterItem => filterItem.id === item.id);
      if (itemIndex === -1) {
        existingItems.push(item);
      } else {
        existingItems[itemIndex] = item;
      }
    });
    apiRef.current.setFilterModel((0, _extends2.default)({}, filterModel, {
      items: existingItems
    }), 'upsertFilterItems');
  }, [apiRef]);
  const deleteFilterItem = React.useCallback(itemToDelete => {
    const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
    const items = filterModel.items.filter(item => item.id !== itemToDelete.id);
    if (items.length === filterModel.items.length) {
      return;
    }
    apiRef.current.setFilterModel((0, _extends2.default)({}, filterModel, {
      items
    }), 'deleteFilterItem');
  }, [apiRef]);
  const showFilterPanel = React.useCallback((targetColumnField, panelId, labelId) => {
    logger.debug('Displaying filter panel');
    if (targetColumnField) {
      const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
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
        newFilterItems = [(0, _gridFilterUtils.cleanFilterItem)({
          field: targetColumnField,
          operator: targetColumn.filterOperators[0].value
        }, apiRef)];
      } else {
        newFilterItems = [...filterItemsWithValue, (0, _gridFilterUtils.cleanFilterItem)({
          field: targetColumnField,
          operator: targetColumn.filterOperators[0].value
        }, apiRef)];
      }
      apiRef.current.setFilterModel((0, _extends2.default)({}, filterModel, {
        items: newFilterItems
      }));
    }
    apiRef.current.showPreferences(_gridPreferencePanelsValue.GridPreferencePanelsValue.filters, panelId, labelId);
  }, [apiRef, logger, props.disableMultipleColumnsFiltering]);
  const hideFilterPanel = React.useCallback(() => {
    logger.debug('Hiding filter panel');
    apiRef.current.hidePreferences();
  }, [apiRef, logger]);
  const setFilterLogicOperator = React.useCallback(logicOperator => {
    const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
    if (filterModel.logicOperator === logicOperator) {
      return;
    }
    apiRef.current.setFilterModel((0, _extends2.default)({}, filterModel, {
      logicOperator
    }), 'changeLogicOperator');
  }, [apiRef]);
  const setQuickFilterValues = React.useCallback(values => {
    const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
    if ((0, _isDeepEqual.isDeepEqual)(filterModel.quickFilterValues, values)) {
      return;
    }
    apiRef.current.setFilterModel((0, _extends2.default)({}, filterModel, {
      quickFilterValues: [...values]
    }));
  }, [apiRef]);
  const setFilterModel = React.useCallback((model, reason) => {
    const currentModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
    if (currentModel !== model) {
      logger.debug('Setting filter model');
      apiRef.current.updateControlState('filter', (0, _gridFilterUtils.mergeStateWithFilterModel)(model, props.disableMultipleColumnsFiltering, apiRef), reason);
      apiRef.current.unstable_applyFilters();
    }
  }, [apiRef, logger, props.disableMultipleColumnsFiltering]);
  const getFilterState = React.useCallback(inputFilterModel => {
    const filterModel = (0, _gridFilterUtils.sanitizeFilterModel)(inputFilterModel, props.disableMultipleColumnsFiltering, apiRef);
    const isRowMatchingFilters = props.filterMode === 'client' ? (0, _gridFilterUtils.buildAggregatedFilterApplier)(filterModel, apiRef, props.disableEval) : null;
    const filterResult = apiRef.current.applyStrategyProcessor('filtering', {
      isRowMatchingFilters,
      filterModel: filterModel ?? (0, _gridFilterState.getDefaultGridFilterModel)()
    });
    return (0, _extends2.default)({}, filterResult, {
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
  (0, _useGridApiMethod.useGridApiMethod)(apiRef, filterApi, 'public');

  /**
   * PRE-PROCESSING
   */
  const stateExportPreProcessing = React.useCallback((prevState, context) => {
    const filterModelToExport = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);

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
    !(0, _isDeepEqual.isDeepEqual)(filterModelToExport, (0, _gridFilterState.getDefaultGridFilterModel)());
    if (!shouldExportFilterModel) {
      return prevState;
    }
    return (0, _extends2.default)({}, prevState, {
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
    apiRef.current.updateControlState('filter', (0, _gridFilterUtils.mergeStateWithFilterModel)(filterModel, props.disableMultipleColumnsFiltering, apiRef), 'restoreState');
    return (0, _extends2.default)({}, params, {
      callbacks: [...params.callbacks, apiRef.current.unstable_applyFilters]
    });
  }, [apiRef, props.disableMultipleColumnsFiltering]);
  const preferencePanelPreProcessing = React.useCallback((initialValue, value) => {
    if (value === _gridPreferencePanelsValue.GridPreferencePanelsValue.filters) {
      const FilterPanel = props.slots.filterPanel;
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(FilterPanel, (0, _extends2.default)({}, props.slotProps?.filterPanel));
    }
    return initialValue;
  }, [props.slots.filterPanel, props.slotProps?.filterPanel]);
  const {
    getRowId
  } = props;
  const getRowsRef = (0, _useLazyRef.useLazyRef)(createMemoizedValues);
  const flatFilteringMethod = React.useCallback(params => {
    if (props.filterMode !== 'client' || !params.isRowMatchingFilters || !params.filterModel.items.length && !params.filterModel.quickFilterValues?.length) {
      return _gridFilterState.defaultGridFilterLookup;
    }
    const dataRowIdToModelLookup = (0, _rows.gridRowsLookupSelector)(apiRef);
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
      const isRowPassing = (0, _gridFilterUtils.passFilterLogic)([result.passingFilterItems], [result.passingQuickFilterValues], params.filterModel, apiRef, filterCache);
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
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'columnMenu', addColumnMenuItem);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'exportState', stateExportPreProcessing);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'restoreState', stateRestorePreProcessing);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'preferencePanel', preferencePanelPreProcessing);
  (0, _strategyProcessing.useGridRegisterStrategyProcessor)(apiRef, _strategyProcessing.GRID_DEFAULT_STRATEGY, 'filtering', flatFilteringMethod);
  (0, _strategyProcessing.useGridRegisterStrategyProcessor)(apiRef, _strategyProcessing.GRID_DEFAULT_STRATEGY, 'visibleRowsLookupCreation', getVisibleRowsLookup);

  /**
   * EVENTS
   */
  const handleColumnsChange = React.useCallback(() => {
    logger.debug('onColUpdated - GridColumns changed, applying filters');
    const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
    const columnsLookup = (0, _gridColumnsSelector.gridColumnLookupSelector)(apiRef);
    const newFilterItems = filterModel.items.filter(item => item.field && columnsLookup[item.field]);
    if (newFilterItems.length < filterModel.items.length) {
      apiRef.current.setFilterModel((0, _extends2.default)({}, filterModel, {
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
      return (0, _extends2.default)({}, state, {
        visibleRowsLookup: getVisibleRowsLookupState(apiRef, state)
      });
    });
  }, [apiRef]);
  (0, _useGridEvent.useGridEvent)(apiRef, 'rowsSet', updateFilteredRows);
  (0, _useGridEvent.useGridEvent)(apiRef, 'columnsChange', handleColumnsChange);
  (0, _useGridEvent.useGridEvent)(apiRef, 'activeStrategyProcessorChange', handleStrategyProcessorChange);
  (0, _useGridEvent.useGridEvent)(apiRef, 'rowExpansionChange', updateVisibleRowsLookupState);
  (0, _useGridEvent.useGridEvent)(apiRef, 'columnVisibilityModelChange', () => {
    const filterModel = (0, _gridFilterSelector.gridFilterModelSelector)(apiRef);
    if (filterModel.quickFilterValues?.length && (0, _gridFilterUtils.shouldQuickFilterExcludeHiddenColumns)(filterModel)) {
      // re-apply filters because the quick filter results may have changed
      updateFilteredRows();
    }
  });

  /**
   * 1ST RENDER
   */
  (0, _useFirstRender.useFirstRender)(() => {
    updateFilteredRows();
  });

  /**
   * EFFECTS
   */
  (0, _useEnhancedEffect.default)(() => {
    if (props.filterModel !== undefined) {
      apiRef.current.setFilterModel(props.filterModel);
    }
  }, [apiRef, logger, props.filterModel]);
};
exports.useGridFilter = useGridFilter;
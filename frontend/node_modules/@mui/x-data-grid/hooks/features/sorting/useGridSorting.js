"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridSorting = exports.sortingStateInitializer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _useGridEvent = require("../../utils/useGridEvent");
var _useGridApiMethod = require("../../utils/useGridApiMethod");
var _useGridLogger = require("../../utils/useGridLogger");
var _gridColumnsSelector = require("../columns/gridColumnsSelector");
var _gridSortingSelector = require("./gridSortingSelector");
var _rows = require("../rows");
var _useFirstRender = require("../../utils/useFirstRender");
var _strategyProcessing = require("../../core/strategyProcessing");
var _gridSortingUtils = require("./gridSortingUtils");
var _pipeProcessing = require("../../core/pipeProcessing");
var _gridRowsUtils = require("../rows/gridRowsUtils");
const sortingStateInitializer = (state, props) => {
  const sortModel = props.sortModel ?? props.initialState?.sorting?.sortModel ?? [];
  return (0, _extends2.default)({}, state, {
    sorting: {
      sortModel: (0, _gridSortingUtils.sanitizeSortModel)(sortModel, props.disableMultipleColumnsSorting),
      sortedRows: []
    }
  });
};

/**
 * @requires useGridRows (event)
 * @requires useGridColumns (event)
 */
exports.sortingStateInitializer = sortingStateInitializer;
const useGridSorting = (apiRef, props) => {
  const logger = (0, _useGridLogger.useGridLogger)(apiRef, 'useGridSorting');
  apiRef.current.registerControlState({
    stateId: 'sortModel',
    propModel: props.sortModel,
    propOnChange: props.onSortModelChange,
    stateSelector: _gridSortingSelector.gridSortModelSelector,
    changeEvent: 'sortModelChange'
  });
  const upsertSortModel = React.useCallback((field, sortItem) => {
    const sortModel = (0, _gridSortingSelector.gridSortModelSelector)(apiRef);
    const existingIdx = sortModel.findIndex(c => c.field === field);
    let newSortModel = [...sortModel];
    if (existingIdx > -1) {
      if (sortItem?.sort == null) {
        newSortModel.splice(existingIdx, 1);
      } else {
        newSortModel.splice(existingIdx, 1, sortItem);
      }
    } else {
      newSortModel = [...sortModel, sortItem];
    }
    return newSortModel;
  }, [apiRef]);
  const createSortItem = React.useCallback((col, directionOverride) => {
    const sortModel = (0, _gridSortingSelector.gridSortModelSelector)(apiRef);
    const existing = sortModel.find(c => c.field === col.field);
    if (existing) {
      const nextSort = directionOverride === undefined ? (0, _gridSortingUtils.getNextGridSortDirection)(col.sortingOrder ?? props.sortingOrder, existing.sort) : directionOverride;
      return nextSort === undefined ? undefined : (0, _extends2.default)({}, existing, {
        sort: nextSort
      });
    }
    return {
      field: col.field,
      sort: directionOverride === undefined ? (0, _gridSortingUtils.getNextGridSortDirection)(col.sortingOrder ?? props.sortingOrder) : directionOverride
    };
  }, [apiRef, props.sortingOrder]);
  const addColumnMenuItem = React.useCallback((columnMenuItems, colDef) => {
    if (colDef == null || colDef.sortable === false || props.disableColumnSorting) {
      return columnMenuItems;
    }
    const sortingOrder = colDef.sortingOrder || props.sortingOrder;
    if (sortingOrder.some(item => !!item)) {
      return [...columnMenuItems, 'columnMenuSortItem'];
    }
    return columnMenuItems;
  }, [props.sortingOrder, props.disableColumnSorting]);

  /**
   * API METHODS
   */
  const applySorting = React.useCallback(() => {
    apiRef.current.setState(state => {
      if (props.sortingMode === 'server') {
        logger.debug('Skipping sorting rows as sortingMode = server');
        return (0, _extends2.default)({}, state, {
          sorting: (0, _extends2.default)({}, state.sorting, {
            sortedRows: (0, _gridRowsUtils.getTreeNodeDescendants)((0, _rows.gridRowTreeSelector)(apiRef), _rows.GRID_ROOT_GROUP_ID, false)
          })
        });
      }
      const sortModel = (0, _gridSortingSelector.gridSortModelSelector)(apiRef);
      const sortRowList = (0, _gridSortingUtils.buildAggregatedSortingApplier)(sortModel, apiRef);
      const sortedRows = apiRef.current.applyStrategyProcessor('sorting', {
        sortRowList
      });
      return (0, _extends2.default)({}, state, {
        sorting: (0, _extends2.default)({}, state.sorting, {
          sortedRows
        })
      });
    });
    apiRef.current.publishEvent('sortedRowsSet');
  }, [apiRef, logger, props.sortingMode]);
  const setSortModel = React.useCallback(model => {
    const currentModel = (0, _gridSortingSelector.gridSortModelSelector)(apiRef);
    if (currentModel !== model) {
      logger.debug(`Setting sort model`);
      apiRef.current.setState((0, _gridSortingUtils.mergeStateWithSortModel)(model, props.disableMultipleColumnsSorting));
      apiRef.current.applySorting();
    }
  }, [apiRef, logger, props.disableMultipleColumnsSorting]);
  const sortColumn = React.useCallback((field, direction, allowMultipleSorting) => {
    const column = apiRef.current.getColumn(field);
    const sortItem = createSortItem(column, direction);
    let sortModel;
    if (!allowMultipleSorting || props.disableMultipleColumnsSorting) {
      sortModel = sortItem?.sort == null ? [] : [sortItem];
    } else {
      sortModel = upsertSortModel(column.field, sortItem);
    }
    apiRef.current.setSortModel(sortModel);
  }, [apiRef, upsertSortModel, createSortItem, props.disableMultipleColumnsSorting]);
  const getSortModel = React.useCallback(() => (0, _gridSortingSelector.gridSortModelSelector)(apiRef), [apiRef]);
  const getSortedRows = React.useCallback(() => {
    const sortedRows = (0, _gridSortingSelector.gridSortedRowEntriesSelector)(apiRef);
    return sortedRows.map(row => row.model);
  }, [apiRef]);
  const getSortedRowIds = React.useCallback(() => (0, _gridSortingSelector.gridSortedRowIdsSelector)(apiRef), [apiRef]);
  const getRowIdFromRowIndex = React.useCallback(index => apiRef.current.getSortedRowIds()[index], [apiRef]);
  const sortApi = {
    getSortModel,
    getSortedRows,
    getSortedRowIds,
    getRowIdFromRowIndex,
    setSortModel,
    sortColumn,
    applySorting
  };
  (0, _useGridApiMethod.useGridApiMethod)(apiRef, sortApi, 'public');

  /**
   * PRE-PROCESSING
   */
  const stateExportPreProcessing = React.useCallback((prevState, context) => {
    const sortModelToExport = (0, _gridSortingSelector.gridSortModelSelector)(apiRef);
    const shouldExportSortModel =
    // Always export if the `exportOnlyDirtyModels` property is not activated
    !context.exportOnlyDirtyModels ||
    // Always export if the model is controlled
    props.sortModel != null ||
    // Always export if the model has been initialized
    props.initialState?.sorting?.sortModel != null ||
    // Export if the model is not empty
    sortModelToExport.length > 0;
    if (!shouldExportSortModel) {
      return prevState;
    }
    return (0, _extends2.default)({}, prevState, {
      sorting: {
        sortModel: sortModelToExport
      }
    });
  }, [apiRef, props.sortModel, props.initialState?.sorting?.sortModel]);
  const stateRestorePreProcessing = React.useCallback((params, context) => {
    const sortModel = context.stateToRestore.sorting?.sortModel;
    if (sortModel == null) {
      return params;
    }
    apiRef.current.setState((0, _gridSortingUtils.mergeStateWithSortModel)(sortModel, props.disableMultipleColumnsSorting));
    return (0, _extends2.default)({}, params, {
      callbacks: [...params.callbacks, apiRef.current.applySorting]
    });
  }, [apiRef, props.disableMultipleColumnsSorting]);
  const flatSortingMethod = React.useCallback(params => {
    const rowTree = (0, _rows.gridRowTreeSelector)(apiRef);
    const rootGroupNode = rowTree[_rows.GRID_ROOT_GROUP_ID];
    const sortedChildren = params.sortRowList ? params.sortRowList(rootGroupNode.children.map(childId => rowTree[childId])) : [...rootGroupNode.children];
    if (rootGroupNode.footerId != null) {
      sortedChildren.push(rootGroupNode.footerId);
    }
    return sortedChildren;
  }, [apiRef]);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'exportState', stateExportPreProcessing);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'restoreState', stateRestorePreProcessing);
  (0, _strategyProcessing.useGridRegisterStrategyProcessor)(apiRef, _strategyProcessing.GRID_DEFAULT_STRATEGY, 'sorting', flatSortingMethod);

  /**
   * EVENTS
   */
  const handleColumnHeaderClick = React.useCallback(({
    field,
    colDef
  }, event) => {
    if (!colDef.sortable || props.disableColumnSorting) {
      return;
    }
    const allowMultipleSorting = props.multipleColumnsSortingMode === 'always' || event.shiftKey || event.metaKey || event.ctrlKey;
    sortColumn(field, undefined, allowMultipleSorting);
  }, [sortColumn, props.disableColumnSorting, props.multipleColumnsSortingMode]);
  const handleColumnHeaderKeyDown = React.useCallback(({
    field,
    colDef
  }, event) => {
    if (!colDef.sortable || props.disableColumnSorting) {
      return;
    }
    // Ctrl + Enter opens the column menu
    if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
      sortColumn(field, undefined, props.multipleColumnsSortingMode === 'always' || event.shiftKey);
    }
  }, [sortColumn, props.disableColumnSorting, props.multipleColumnsSortingMode]);
  const handleColumnsChange = React.useCallback(() => {
    // When the columns change we check that the sorted columns are still part of the dataset
    const sortModel = (0, _gridSortingSelector.gridSortModelSelector)(apiRef);
    const latestColumns = (0, _gridColumnsSelector.gridColumnLookupSelector)(apiRef);
    if (sortModel.length > 0) {
      const newModel = sortModel.filter(sortItem => latestColumns[sortItem.field]);
      if (newModel.length < sortModel.length) {
        apiRef.current.setSortModel(newModel);
      }
    }
  }, [apiRef]);
  const handleStrategyProcessorChange = React.useCallback(methodName => {
    if (methodName === 'sorting') {
      apiRef.current.applySorting();
    }
  }, [apiRef]);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'columnMenu', addColumnMenuItem);
  (0, _useGridEvent.useGridEvent)(apiRef, 'columnHeaderClick', handleColumnHeaderClick);
  (0, _useGridEvent.useGridEvent)(apiRef, 'columnHeaderKeyDown', handleColumnHeaderKeyDown);
  (0, _useGridEvent.useGridEvent)(apiRef, 'rowsSet', apiRef.current.applySorting);
  (0, _useGridEvent.useGridEvent)(apiRef, 'columnsChange', handleColumnsChange);
  (0, _useGridEvent.useGridEvent)(apiRef, 'activeStrategyProcessorChange', handleStrategyProcessorChange);

  /**
   * 1ST RENDER
   */
  (0, _useFirstRender.useFirstRender)(() => {
    apiRef.current.applySorting();
  });

  /**
   * EFFECTS
   */
  (0, _useEnhancedEffect.default)(() => {
    if (props.sortModel !== undefined) {
      apiRef.current.setSortModel(props.sortModel);
    }
  }, [apiRef, props.sortModel]);
};
exports.useGridSorting = useGridSorting;
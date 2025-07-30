"use strict";
'use client';

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridPaginationMeta = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _utils = require("../../utils");
var _pipeProcessing = require("../../core/pipeProcessing");
var _gridPaginationSelector = require("./gridPaginationSelector");
const useGridPaginationMeta = (apiRef, props) => {
  const logger = (0, _utils.useGridLogger)(apiRef, 'useGridPaginationMeta');
  const paginationMeta = (0, _utils.useGridSelector)(apiRef, _gridPaginationSelector.gridPaginationMetaSelector);
  apiRef.current.registerControlState({
    stateId: 'paginationMeta',
    propModel: props.paginationMeta,
    propOnChange: props.onPaginationMetaChange,
    stateSelector: _gridPaginationSelector.gridPaginationMetaSelector,
    changeEvent: 'paginationMetaChange'
  });

  /**
   * API METHODS
   */
  const setPaginationMeta = React.useCallback(newPaginationMeta => {
    if (paginationMeta === newPaginationMeta) {
      return;
    }
    logger.debug("Setting 'paginationMeta' to", newPaginationMeta);
    apiRef.current.setState(state => (0, _extends2.default)({}, state, {
      pagination: (0, _extends2.default)({}, state.pagination, {
        meta: newPaginationMeta
      })
    }));
  }, [apiRef, logger, paginationMeta]);
  const paginationMetaApi = {
    setPaginationMeta
  };
  (0, _utils.useGridApiMethod)(apiRef, paginationMetaApi, 'public');

  /**
   * PRE-PROCESSING
   */
  const stateExportPreProcessing = React.useCallback((prevState, context) => {
    const exportedPaginationMeta = (0, _gridPaginationSelector.gridPaginationMetaSelector)(apiRef);
    const shouldExportRowCount =
    // Always export if the `exportOnlyDirtyModels` property is not activated
    !context.exportOnlyDirtyModels ||
    // Always export if the `paginationMeta` is controlled
    props.paginationMeta != null ||
    // Always export if the `paginationMeta` has been initialized
    props.initialState?.pagination?.meta != null;
    if (!shouldExportRowCount) {
      return prevState;
    }
    return (0, _extends2.default)({}, prevState, {
      pagination: (0, _extends2.default)({}, prevState.pagination, {
        meta: exportedPaginationMeta
      })
    });
  }, [apiRef, props.paginationMeta, props.initialState?.pagination?.meta]);
  const stateRestorePreProcessing = React.useCallback((params, context) => {
    const restoredPaginationMeta = context.stateToRestore.pagination?.meta ? context.stateToRestore.pagination.meta : (0, _gridPaginationSelector.gridPaginationMetaSelector)(apiRef);
    apiRef.current.setState(state => (0, _extends2.default)({}, state, {
      pagination: (0, _extends2.default)({}, state.pagination, {
        meta: restoredPaginationMeta
      })
    }));
    return params;
  }, [apiRef]);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'exportState', stateExportPreProcessing);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'restoreState', stateRestorePreProcessing);

  /**
   * EFFECTS
   */
  React.useEffect(() => {
    if (props.paginationMeta) {
      apiRef.current.setPaginationMeta(props.paginationMeta);
    }
  }, [apiRef, props.paginationMeta]);
};
exports.useGridPaginationMeta = useGridPaginationMeta;
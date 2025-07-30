"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridStatePersistence = void 0;
var React = _interopRequireWildcard(require("react"));
var _utils = require("../../utils");
const useGridStatePersistence = apiRef => {
  const exportState = React.useCallback((params = {}) => {
    const stateToExport = apiRef.current.unstable_applyPipeProcessors('exportState', {}, params);
    return stateToExport;
  }, [apiRef]);
  const restoreState = React.useCallback(stateToRestore => {
    const response = apiRef.current.unstable_applyPipeProcessors('restoreState', {
      callbacks: []
    }, {
      stateToRestore
    });
    response.callbacks.forEach(callback => {
      callback();
    });
  }, [apiRef]);
  const statePersistenceApi = {
    exportState,
    restoreState
  };
  (0, _utils.useGridApiMethod)(apiRef, statePersistenceApi, 'public');
};
exports.useGridStatePersistence = useGridStatePersistence;
"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useGridPreferencesPanel = exports.preferencePanelStateInitializer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var React = _interopRequireWildcard(require("react"));
var _useGridApiMethod = require("../../utils/useGridApiMethod");
var _useGridLogger = require("../../utils/useGridLogger");
var _pipeProcessing = require("../../core/pipeProcessing");
var _gridPreferencePanelSelector = require("./gridPreferencePanelSelector");
const preferencePanelStateInitializer = (state, props) => (0, _extends2.default)({}, state, {
  preferencePanel: props.initialState?.preferencePanel ?? {
    open: false
  }
});

/**
 * TODO: Add a single `setPreferencePanel` method to avoid multiple `setState`
 */
exports.preferencePanelStateInitializer = preferencePanelStateInitializer;
const useGridPreferencesPanel = (apiRef, props) => {
  const logger = (0, _useGridLogger.useGridLogger)(apiRef, 'useGridPreferencesPanel');

  /**
   * API METHODS
   */
  const hidePreferences = React.useCallback(() => {
    apiRef.current.setState(state => {
      if (!state.preferencePanel.open) {
        return state;
      }
      logger.debug('Hiding Preferences Panel');
      const preferencePanelState = (0, _gridPreferencePanelSelector.gridPreferencePanelStateSelector)(apiRef);
      apiRef.current.publishEvent('preferencePanelClose', {
        openedPanelValue: preferencePanelState.openedPanelValue
      });
      return (0, _extends2.default)({}, state, {
        preferencePanel: {
          open: false
        }
      });
    });
  }, [apiRef, logger]);
  const showPreferences = React.useCallback((newValue, panelId, labelId) => {
    logger.debug('Opening Preferences Panel');
    apiRef.current.setState(state => (0, _extends2.default)({}, state, {
      preferencePanel: (0, _extends2.default)({}, state.preferencePanel, {
        open: true,
        openedPanelValue: newValue,
        panelId,
        labelId
      })
    }));
    apiRef.current.publishEvent('preferencePanelOpen', {
      openedPanelValue: newValue
    });
  }, [logger, apiRef]);
  (0, _useGridApiMethod.useGridApiMethod)(apiRef, {
    showPreferences,
    hidePreferences
  }, 'public');

  /**
   * PRE-PROCESSING
   */
  const stateExportPreProcessing = React.useCallback((prevState, context) => {
    const preferencePanelToExport = (0, _gridPreferencePanelSelector.gridPreferencePanelStateSelector)(apiRef);
    const shouldExportPreferencePanel =
    // Always export if the `exportOnlyDirtyModels` property is not activated
    !context.exportOnlyDirtyModels ||
    // Always export if the panel was initialized
    props.initialState?.preferencePanel != null ||
    // Always export if the panel is opened
    preferencePanelToExport.open;
    if (!shouldExportPreferencePanel) {
      return prevState;
    }
    return (0, _extends2.default)({}, prevState, {
      preferencePanel: preferencePanelToExport
    });
  }, [apiRef, props.initialState?.preferencePanel]);
  const stateRestorePreProcessing = React.useCallback((params, context) => {
    const preferencePanel = context.stateToRestore.preferencePanel;
    if (preferencePanel != null) {
      apiRef.current.setState(state => (0, _extends2.default)({}, state, {
        preferencePanel
      }));
    }
    return params;
  }, [apiRef]);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'exportState', stateExportPreProcessing);
  (0, _pipeProcessing.useGridRegisterPipeProcessor)(apiRef, 'restoreState', stateRestorePreProcessing);
};
exports.useGridPreferencesPanel = useGridPreferencesPanel;
import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useGridApiMethod } from "../../utils/useGridApiMethod.js";
import { useGridLogger } from "../../utils/useGridLogger.js";
import { useGridRegisterPipeProcessor } from "../../core/pipeProcessing/index.js";
import { gridPreferencePanelStateSelector } from "./gridPreferencePanelSelector.js";
export const preferencePanelStateInitializer = (state, props) => _extends({}, state, {
  preferencePanel: props.initialState?.preferencePanel ?? {
    open: false
  }
});

/**
 * TODO: Add a single `setPreferencePanel` method to avoid multiple `setState`
 */
export const useGridPreferencesPanel = (apiRef, props) => {
  const logger = useGridLogger(apiRef, 'useGridPreferencesPanel');

  /**
   * API METHODS
   */
  const hidePreferences = React.useCallback(() => {
    apiRef.current.setState(state => {
      if (!state.preferencePanel.open) {
        return state;
      }
      logger.debug('Hiding Preferences Panel');
      const preferencePanelState = gridPreferencePanelStateSelector(apiRef);
      apiRef.current.publishEvent('preferencePanelClose', {
        openedPanelValue: preferencePanelState.openedPanelValue
      });
      return _extends({}, state, {
        preferencePanel: {
          open: false
        }
      });
    });
  }, [apiRef, logger]);
  const showPreferences = React.useCallback((newValue, panelId, labelId) => {
    logger.debug('Opening Preferences Panel');
    apiRef.current.setState(state => _extends({}, state, {
      preferencePanel: _extends({}, state.preferencePanel, {
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
  useGridApiMethod(apiRef, {
    showPreferences,
    hidePreferences
  }, 'public');

  /**
   * PRE-PROCESSING
   */
  const stateExportPreProcessing = React.useCallback((prevState, context) => {
    const preferencePanelToExport = gridPreferencePanelStateSelector(apiRef);
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
    return _extends({}, prevState, {
      preferencePanel: preferencePanelToExport
    });
  }, [apiRef, props.initialState?.preferencePanel]);
  const stateRestorePreProcessing = React.useCallback((params, context) => {
    const preferencePanel = context.stateToRestore.preferencePanel;
    if (preferencePanel != null) {
      apiRef.current.setState(state => _extends({}, state, {
        preferencePanel
      }));
    }
    return params;
  }, [apiRef]);
  useGridRegisterPipeProcessor(apiRef, 'exportState', stateExportPreProcessing);
  useGridRegisterPipeProcessor(apiRef, 'restoreState', stateRestorePreProcessing);
};
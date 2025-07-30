import { useGridRefs } from "./useGridRefs.js";
import { useGridIsRtl } from "./useGridIsRtl.js";
import { useGridLoggerFactory } from "./useGridLoggerFactory.js";
import { useGridLocaleText } from "./useGridLocaleText.js";
import { useGridPipeProcessing } from "./pipeProcessing/index.js";
import { useGridStrategyProcessing } from "./strategyProcessing/index.js";
import { useGridStateInitialization } from "./useGridStateInitialization.js";
import { useGridProps } from "./useGridProps.js";

/**
 * Initialize the technical pieces of the DataGrid (logger, state, ...) that any DataGrid implementation needs
 */
export const useGridInitialization = (privateApiRef, props) => {
  useGridRefs(privateApiRef);
  useGridProps(privateApiRef, props);
  useGridIsRtl(privateApiRef);
  useGridLoggerFactory(privateApiRef, props);
  useGridStateInitialization(privateApiRef);
  useGridPipeProcessing(privateApiRef);
  useGridStrategyProcessing(privateApiRef);
  useGridLocaleText(privateApiRef, props);
  privateApiRef.current.register('private', {
    rootProps: props
  });
};
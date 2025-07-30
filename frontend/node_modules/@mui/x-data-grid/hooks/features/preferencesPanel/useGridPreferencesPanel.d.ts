import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
export declare const preferencePanelStateInitializer: GridStateInitializer<Pick<DataGridProcessedProps, 'initialState'>>;
/**
 * TODO: Add a single `setPreferencePanel` method to avoid multiple `setState`
 */
export declare const useGridPreferencesPanel: (apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, "initialState">) => void;
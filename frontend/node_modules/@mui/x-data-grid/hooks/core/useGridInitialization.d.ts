import { RefObject } from '@mui/x-internals/types';
import type { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
import { DataGridProcessedProps } from "../../models/props/DataGridProps.js";
/**
 * Initialize the technical pieces of the DataGrid (logger, state, ...) that any DataGrid implementation needs
 */
export declare const useGridInitialization: <PrivateApi extends GridPrivateApiCommon>(privateApiRef: RefObject<PrivateApi>, props: DataGridProcessedProps) => void;
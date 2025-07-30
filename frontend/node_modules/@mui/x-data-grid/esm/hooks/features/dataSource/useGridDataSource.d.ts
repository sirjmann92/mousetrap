import { RefObject } from '@mui/x-internals/types';
import type { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import type { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
/**
 * Community version of the data source hook. Contains implementation of the `useGridDataSourceBase` hook.
 */
export declare const useGridDataSource: (apiRef: RefObject<GridPrivateApiCommunity>, props: DataGridProcessedProps) => void;
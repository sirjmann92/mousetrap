import { RefObject } from '@mui/x-internals/types';
import type { GridListViewColDef } from "../../../models/colDef/gridColDef.js";
import { GridStateInitializer } from "../../utils/useGridInitializeState.js";
import { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
export type GridListViewState = (GridListViewColDef & {
  computedWidth: number;
}) | undefined;
export declare const listViewStateInitializer: GridStateInitializer<Pick<DataGridProcessedProps, 'listViewColumn'>>;
export declare function useGridListView(apiRef: RefObject<GridPrivateApiCommunity>, props: Pick<DataGridProcessedProps, 'listView' | 'listViewColumn'>): void;
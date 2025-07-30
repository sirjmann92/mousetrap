import { RefObject } from '@mui/x-internals/types';
import { GridApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
/**
 * @requires useGridFocus (event) - can be after, async only
 * @requires useGridColumns (event) - can be after, async only
 */
export declare function useGridEvents(apiRef: RefObject<GridApiCommunity>, props: Pick<DataGridProcessedProps, 'onColumnHeaderClick' | 'onColumnHeaderDoubleClick' | 'onColumnHeaderContextMenu' | 'onColumnHeaderOver' | 'onColumnHeaderOut' | 'onColumnHeaderEnter' | 'onColumnHeaderLeave' | 'onCellClick' | 'onCellDoubleClick' | 'onCellKeyDown' | 'onPreferencePanelClose' | 'onPreferencePanelOpen' | 'onRowDoubleClick' | 'onRowClick' | 'onStateChange' | 'onMenuOpen' | 'onMenuClose'>): void;
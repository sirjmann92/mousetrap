import { RefObject } from '@mui/x-internals/types';
import type { GridRowId, GridRowTreeConfig } from "../../../models/gridRows.js";
import type { DataGridProcessedProps } from "../../../models/props/DataGridProps.js";
import type { GridPrivateApiCommunity } from "../../../models/api/gridApiCommunity.js";
import { type GridRowSelectionPropagation } from "../../../models/gridRowSelectionModel.js";
import { type RowSelectionManager } from "../../../models/gridRowSelectionManager.js";
export declare const ROW_SELECTION_PROPAGATION_DEFAULT: GridRowSelectionPropagation;
export declare const checkboxPropsSelector: (args_0: import("react").RefObject<{
  state: import("../../../models/gridStateCommunity.js").GridStateCommunity;
} | null>, args_1: {
  groupId: GridRowId;
  autoSelectParents: boolean;
}) => {
  isIndeterminate: boolean;
  isChecked: boolean;
};
export declare function isMultipleRowSelectionEnabled(props: Pick<DataGridProcessedProps, 'signature' | 'disableMultipleRowSelection' | 'checkboxSelection'>): boolean;
export declare const findRowsToSelect: (apiRef: RefObject<GridPrivateApiCommunity>, tree: GridRowTreeConfig, selectedRow: GridRowId, autoSelectDescendants: boolean, autoSelectParents: boolean, addRow: (rowId: GridRowId) => void, rowSelectionManager?: RowSelectionManager) => void;
export declare const findRowsToDeselect: (apiRef: RefObject<GridPrivateApiCommunity>, tree: GridRowTreeConfig, deselectedRow: GridRowId, autoSelectDescendants: boolean, autoSelectParents: boolean, removeRow: (rowId: GridRowId) => void) => void;
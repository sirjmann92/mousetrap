import type { GridRowId } from "./gridRows.js";
import type { GridRowSelectionModel } from "./gridRowSelectionModel.js";
export interface RowSelectionManager {
  data: Set<GridRowId>;
  has(id: GridRowId): boolean;
  select(id: GridRowId): void;
  unselect(id: GridRowId): void;
}
export declare const createRowSelectionManager: (model: GridRowSelectionModel) => RowSelectionManager;
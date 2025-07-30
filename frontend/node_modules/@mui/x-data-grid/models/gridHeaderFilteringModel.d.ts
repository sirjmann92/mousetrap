import { GridColDef } from "./colDef/index.js";
export type GridHeaderFilteringState = {
  enabled: boolean;
  editing: GridColDef['field'] | null;
  menuOpen: GridColDef['field'] | null;
};
import type { GridColDef, GridSingleSelectColDef } from "../../../models/colDef/gridColDef.js";
import type { GridValueOptionsParams } from "../../../models/params/gridValueOptionsParams.js";
export declare function isSingleSelectColDef(colDef: GridColDef | null): colDef is GridSingleSelectColDef;
export declare function getValueOptions(column: GridSingleSelectColDef, additionalParams?: Omit<GridValueOptionsParams, 'field'>): import("@mui/x-data-grid").ValueOptions[] | undefined;
export declare function getValueFromValueOptions(value: string, valueOptions: any[] | undefined, getOptionValue: NonNullable<GridSingleSelectColDef['getOptionValue']>): any;
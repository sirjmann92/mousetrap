import type { GetApplyQuickFilterFn } from "../models/colDef/gridColDef.js";
import { GridFilterOperator } from "../models/gridFilterOperator.js";
export declare const getGridStringQuickFilterFn: GetApplyQuickFilterFn<any, unknown>;
export declare const getGridStringOperators: (disableTrim?: boolean) => GridFilterOperator<any, number | string | null, any>[];
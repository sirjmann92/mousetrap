import { GridFilterOperator } from "../models/gridFilterOperator.js";
import type { GridFilterInputValueProps } from "../models/gridFilterInputComponent.js";
import type { GetApplyQuickFilterFn } from "../models/colDef/gridColDef.js";
export declare const getGridNumericQuickFilterFn: GetApplyQuickFilterFn<any, number | string | null>;
export declare const getGridNumericOperators: () => GridFilterOperator<any, number | string | null, any, GridFilterInputValueProps & {
  type?: "number";
}>[];
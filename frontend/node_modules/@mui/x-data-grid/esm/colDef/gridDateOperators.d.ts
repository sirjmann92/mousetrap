import { GridFilterInputDateProps } from "../components/panel/filterPanel/GridFilterInputDate.js";
import { GridFilterOperator } from "../models/gridFilterOperator.js";
export declare const getGridDateOperators: (showTime?: boolean) => GridFilterOperator<any, Date, any, GridFilterInputDateProps>[];
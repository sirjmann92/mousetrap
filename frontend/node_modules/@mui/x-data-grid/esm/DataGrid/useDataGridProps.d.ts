import { DataGridProcessedProps, DataGridProps } from "../models/props/DataGridProps.js";
import { GridValidRowModel } from "../models/index.js";
export declare const useDataGridProps: <R extends GridValidRowModel>(inProps: DataGridProps<R>) => DataGridProcessedProps<R>;
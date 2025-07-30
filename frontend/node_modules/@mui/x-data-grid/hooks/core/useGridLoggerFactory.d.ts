import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
import { DataGridProcessedProps } from "../../models/props/DataGridProps.js";
export declare const useGridLoggerFactory: (apiRef: RefObject<GridPrivateApiCommon>, props: Pick<DataGridProcessedProps, "logger" | "logLevel">) => void;
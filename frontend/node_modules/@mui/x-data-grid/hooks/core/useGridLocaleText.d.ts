import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
import { DataGridProcessedProps } from "../../models/props/DataGridProps.js";
export declare const useGridLocaleText: (apiRef: RefObject<GridPrivateApiCommon>, props: Pick<DataGridProcessedProps, "localeText">) => void;
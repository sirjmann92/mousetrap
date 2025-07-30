import type { RefObject } from '@mui/x-internals/types';
import type { DataGridProcessedProps } from "../../models/props/DataGridProps.js";
import type { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
import type { GridStateInitializer } from "../utils/useGridInitializeState.js";
type Props = Pick<DataGridProcessedProps, 'getRowId' | 'listView'>;
export declare const propsStateInitializer: GridStateInitializer<Props>;
export declare const useGridProps: <PrivateApi extends GridPrivateApiCommon>(apiRef: RefObject<PrivateApi>, props: Props) => void;
export {};
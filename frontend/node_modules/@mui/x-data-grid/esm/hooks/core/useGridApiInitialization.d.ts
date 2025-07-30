import { RefObject } from '@mui/x-internals/types';
import { DataGridProcessedProps } from "../../models/props/DataGridProps.js";
import type { GridApiCommon, GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
export declare function unwrapPrivateAPI<PrivateApi extends GridPrivateApiCommon, Api extends GridApiCommon>(publicApi: Api): PrivateApi;
export declare function useGridApiInitialization<PrivateApi extends GridPrivateApiCommon, Api extends GridApiCommon>(inputApiRef: RefObject<Api | null> | undefined, props: Pick<DataGridProcessedProps, 'signature'>): RefObject<PrivateApi>;
import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
import { GridPrivateApiCommunity } from "../../models/api/gridApiCommunity.js";
import { DataGridProcessedProps } from "../../models/props/DataGridProps.js";
type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
export type GridStateInitializer<P extends Partial<DataGridProcessedProps> = DataGridProcessedProps, PrivateApi extends GridPrivateApiCommon = GridPrivateApiCommunity> = (state: DeepPartial<PrivateApi['state']>, props: P, privateApiRef: RefObject<PrivateApi>) => DeepPartial<PrivateApi['state']>;
export declare const useGridInitializeState: <P extends Partial<DataGridProcessedProps>, PrivateApi extends GridPrivateApiCommon = GridPrivateApiCommunity>(initializer: GridStateInitializer<P, PrivateApi>, privateApiRef: RefObject<PrivateApi>, props: P, key?: string) => void;
export {};
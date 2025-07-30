import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
type GetPublicApiType<PrivateApi> = PrivateApi extends {
  getPublicApi: () => infer PublicApi;
} ? PublicApi : never;
export declare function useGridApiMethod<PrivateApi extends GridPrivateApiCommon, PublicApi extends GetPublicApiType<PrivateApi>, PrivateOnlyApi extends Omit<PrivateApi, keyof PublicApi>, V extends 'public' | 'private', T extends (V extends 'public' ? Partial<PublicApi> : Partial<PrivateOnlyApi>)>(privateApiRef: RefObject<PrivateApi>, apiMethods: T, visibility: V): void;
export {};
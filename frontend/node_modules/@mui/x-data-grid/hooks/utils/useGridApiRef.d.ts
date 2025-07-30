import { RefObject } from '@mui/x-internals/types';
import { GridApiCommon } from "../../models/index.js";
import { GridApiCommunity } from "../../models/api/gridApiCommunity.js";
/**
 * Hook that instantiate a [[GridApiRef]].
 */
export declare const useGridApiRef: <Api extends GridApiCommon = GridApiCommunity>() => RefObject<Api | null>;
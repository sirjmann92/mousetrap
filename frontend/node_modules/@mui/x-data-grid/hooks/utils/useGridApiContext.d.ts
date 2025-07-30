import { RefObject } from '@mui/x-internals/types';
import { GridApiCommon } from "../../models/api/gridApiCommon.js";
import { GridApiCommunity } from "../../models/api/gridApiCommunity.js";
export declare function useGridApiContext<Api extends GridApiCommon = GridApiCommunity>(): RefObject<Api>;
import { RefObject } from '@mui/x-internals/types';
import { Logger } from "../../models/logger.js";
import { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
export declare function useGridLogger<PrivateApi extends GridPrivateApiCommon>(privateApiRef: RefObject<PrivateApi>, name: string): Logger;
import { RefObject } from '@mui/x-internals/types';
import type { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
export declare const useGridStateInitialization: <PrivateApi extends GridPrivateApiCommon>(apiRef: RefObject<PrivateApi>) => void;
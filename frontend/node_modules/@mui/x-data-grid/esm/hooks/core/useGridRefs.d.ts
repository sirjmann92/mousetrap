import { RefObject } from '@mui/x-internals/types';
import type { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
export declare const useGridRefs: <PrivateApi extends GridPrivateApiCommon>(apiRef: RefObject<PrivateApi>) => void;
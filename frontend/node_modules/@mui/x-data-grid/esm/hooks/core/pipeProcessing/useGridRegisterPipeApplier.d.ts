import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommon } from "../../../models/api/gridApiCommon.js";
import { GridPipeProcessorGroup } from "./gridPipeProcessingApi.js";
export declare const useGridRegisterPipeApplier: <PrivateApi extends GridPrivateApiCommon, G extends GridPipeProcessorGroup>(apiRef: RefObject<PrivateApi>, group: G, callback: () => void) => void;
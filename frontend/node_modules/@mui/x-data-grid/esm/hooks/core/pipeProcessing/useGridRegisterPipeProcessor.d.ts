import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommon } from "../../../models/api/gridApiCommon.js";
import { GridPipeProcessorGroup, GridPipeProcessor } from "./gridPipeProcessingApi.js";
export declare const useGridRegisterPipeProcessor: <PrivateApi extends GridPrivateApiCommon, G extends GridPipeProcessorGroup>(apiRef: RefObject<PrivateApi>, group: G, callback: GridPipeProcessor<G>, enabled?: boolean) => void;
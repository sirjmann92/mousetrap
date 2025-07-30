import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommon } from "../../../models/api/gridApiCommon.js";
import { GridStrategyProcessorName, GridStrategyProcessor } from "./gridStrategyProcessingApi.js";
export declare const useGridRegisterStrategyProcessor: <Api extends GridPrivateApiCommon, G extends GridStrategyProcessorName>(apiRef: RefObject<Api>, strategyName: string, group: G, processor: GridStrategyProcessor<G>) => void;
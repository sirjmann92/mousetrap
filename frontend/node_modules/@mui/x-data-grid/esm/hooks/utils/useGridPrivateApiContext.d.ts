import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommon } from "../../models/api/gridApiCommon.js";
import { GridPrivateApiCommunity } from "../../models/api/gridApiCommunity.js";
export declare const GridPrivateApiContext: React.Context<unknown>;
export declare function useGridPrivateApiContext<PrivateApi extends GridPrivateApiCommon = GridPrivateApiCommunity>(): RefObject<PrivateApi>;
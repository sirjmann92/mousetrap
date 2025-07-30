import { RefObject } from '@mui/x-internals/types';
import type { GridApiCommon } from "../../models/api/gridApiCommon.js";
export declare const objectShallowCompare: (a: unknown, b: unknown) => boolean;
export declare const argsEqual: (prev: any, curr: any) => boolean;
export declare function useGridSelector<Api extends GridApiCommon, T>(apiRef: RefObject<Api>, selector: (apiRef: RefObject<Api>) => T, args?: undefined, equals?: <U = T>(a: U, b: U) => boolean): T;
export declare function useGridSelector<Api extends GridApiCommon, T, Args>(apiRef: RefObject<Api>, selector: (apiRef: RefObject<Api>, a1: Args) => T, args: Args, equals?: <U = T>(a: U, b: U) => boolean): T;
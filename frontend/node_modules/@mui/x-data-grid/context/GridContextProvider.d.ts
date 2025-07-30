import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { GridPrivateApiCommunity } from "../models/api/gridApiCommunity.js";
import { GridConfiguration } from "../models/configuration/gridConfiguration.js";
type GridContextProviderProps = {
  privateApiRef: RefObject<GridPrivateApiCommunity>;
  configuration: GridConfiguration;
  props: {};
  children: React.ReactNode;
};
export declare function GridContextProvider({
  privateApiRef,
  configuration,
  props,
  children
}: GridContextProviderProps): React.JSX.Element;
export {};
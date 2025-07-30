import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { GridScrollParams } from "../models/params/gridScrollParams.js";
interface ScrollAreaProps {
  scrollDirection: 'left' | 'right' | 'up' | 'down';
  scrollPosition: RefObject<GridScrollParams>;
}
declare function GridScrollAreaWrapper(props: ScrollAreaProps): React.JSX.Element | null;
export declare const GridScrollArea: typeof GridScrollAreaWrapper;
export {};
import * as React from 'react';
type Props = {
  /** The number of rows */
  rowsLength: number;
};
declare function GridVirtualScrollerFiller({
  rowsLength
}: Props): React.JSX.Element | null;
declare const Memoized: typeof GridVirtualScrollerFiller;
export { Memoized as GridVirtualScrollerFiller };
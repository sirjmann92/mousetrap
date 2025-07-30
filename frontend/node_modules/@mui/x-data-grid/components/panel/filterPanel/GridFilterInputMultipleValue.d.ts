import * as React from 'react';
import { AutocompleteProps } from "../../../models/gridBaseSlots.js";
import { GridFilterInputValueProps } from "../../../models/gridFilterInputComponent.js";
export type GridFilterInputMultipleValueProps = GridFilterInputValueProps<Omit<AutocompleteProps<string, true, false, true>, 'options'>> & {
  type?: 'text' | 'number' | 'date' | 'datetime-local';
};
declare function GridFilterInputMultipleValue(props: GridFilterInputMultipleValueProps): React.JSX.Element;
declare namespace GridFilterInputMultipleValue {
  var propTypes: any;
}
export { GridFilterInputMultipleValue };
import * as React from 'react';
import { TextFieldProps } from "../../../models/gridBaseSlots.js";
import { GridFilterItem } from "../../../models/gridFilterItem.js";
import { GridFilterInputValueProps } from "../../../models/gridFilterInputComponent.js";
export type GridTypeFilterInputValueProps = GridFilterInputValueProps<TextFieldProps> & {
  type?: 'text' | 'number' | 'date' | 'datetime-local';
};
export type ItemPlusTag = GridFilterItem & {
  fromInput?: string;
};
declare function GridFilterInputValue(props: GridTypeFilterInputValueProps): React.JSX.Element;
declare namespace GridFilterInputValue {
  var propTypes: any;
}
export { GridFilterInputValue };
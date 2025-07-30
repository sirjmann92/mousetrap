import * as React from 'react';
import { TextFieldProps } from "../../../models/gridBaseSlots.js";
import { GridFilterInputValueProps } from "../../../models/gridFilterInputComponent.js";
export type GridFilterInputSingleSelectProps = GridFilterInputValueProps<TextFieldProps> & {
  type?: 'singleSelect';
};
declare function GridFilterInputSingleSelect(props: GridFilterInputSingleSelectProps): React.JSX.Element | null;
declare namespace GridFilterInputSingleSelect {
  var propTypes: any;
}
export { GridFilterInputSingleSelect };
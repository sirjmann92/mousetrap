import * as React from 'react';
import { TextFieldProps } from "../../../models/gridBaseSlots.js";
import { GridFilterInputValueProps } from "../../../models/gridFilterInputComponent.js";
export type GridFilterInputBooleanProps = GridFilterInputValueProps<TextFieldProps>;
declare function GridFilterInputBoolean(props: GridFilterInputBooleanProps): React.JSX.Element;
declare namespace GridFilterInputBoolean {
  var propTypes: any;
}
export declare function sanitizeFilterItemValue(value: any): boolean | undefined;
export { GridFilterInputBoolean };
import * as React from 'react';
import { PickerManager } from "../../../models/index.js";
import { UseFieldStateReturnValue } from "./useFieldState.js";
/**
 * Generate the props to pass to the hidden input element of the field.
 * It is not used by the non-accessible DOM structure (with an <input /> element for editing).
 * It should be used in the MUI accessible DOM structure and the Base UI implementation.
 * @param {UseFieldHiddenInputPropsParameters} parameters The parameters of the hook.
 * @returns {UseFieldHiddenInputPropsReturnValue} The props to forward to the hidden input element of the field.
 */
export declare function useFieldHiddenInputProps(parameters: UseFieldHiddenInputPropsParameters): UseFieldHiddenInputPropsReturnValue;
interface UseFieldHiddenInputPropsParameters {
  manager: PickerManager<any, any, any, any, any>;
  stateResponse: UseFieldStateReturnValue<any>;
}
interface UseFieldHiddenInputPropsReturnValue {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}
export {};
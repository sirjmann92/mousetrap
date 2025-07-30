import * as React from 'react';
import { UseFieldStateReturnValue } from "./useFieldState.js";
import { UseFieldInternalProps } from "./useField.types.js";
/**
 * Generate the props to pass to the container element of each section of the field.
 * It is not used by the non-accessible DOM structure (with an <input /> element for editing).
 * It should be used in the MUI accessible DOM structure and the Base UI implementation.
 * @param {UseFieldRootPropsParameters} parameters The parameters of the hook.
 * @returns {UseFieldRootPropsReturnValue} The props to forward to the container element of each section of the field.
 */
export declare function useFieldSectionContainerProps(parameters: UseFieldSectionContainerPropsParameters): UseFieldSectionContainerPropsReturnValue;
interface UseFieldSectionContainerPropsParameters {
  stateResponse: UseFieldStateReturnValue<any>;
  internalPropsWithDefaults: UseFieldInternalProps<any, any, any>;
}
type UseFieldSectionContainerPropsReturnValue = (sectionIndex: number) => React.HTMLAttributes<HTMLSpanElement>;
export {};
import { UseFieldStateReturnValue } from "./useFieldState.js";
import { FieldSection, PickerManager } from "../../../models/index.js";
import { UseFieldDOMGetters, UseFieldInternalProps } from "./useField.types.js";
import { UseFieldCharacterEditingReturnValue } from "./useFieldCharacterEditing.js";
import { PickersSectionElement } from "../../../PickersSectionList/index.js";
/**
 * Generate the props to pass to the content element of each section of the field.
 * It is not used by the non-accessible DOM structure (with an <input /> element for editing).
 * It should be used in the MUI accessible DOM structure and the Base UI implementation.
 * @param {UseFieldRootPropsParameters} parameters The parameters of the hook.
 * @returns {UseFieldRootPropsReturnValue} The props to forward to the content element of each section of the field.
 */
export declare function useFieldSectionContentProps(parameters: UseFieldSectionContentPropsParameters): UseFieldSectionContentPropsReturnValue;
interface UseFieldSectionContentPropsParameters {
  manager: PickerManager<any, any, any, any, any>;
  stateResponse: UseFieldStateReturnValue<any>;
  applyCharacterEditing: UseFieldCharacterEditingReturnValue;
  internalPropsWithDefaults: UseFieldInternalProps<any, any, any>;
  domGetters: UseFieldDOMGetters;
  focused: boolean;
}
type UseFieldSectionContentPropsReturnValue = (section: FieldSection, sectionIndex: number) => PickersSectionElement['content'];
export {};
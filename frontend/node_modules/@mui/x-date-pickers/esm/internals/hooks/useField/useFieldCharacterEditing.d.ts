import { UseFieldStateReturnValue } from "./useFieldState.js";
import { PickerValidValue } from "../../models/index.js";
/**
 * Update the active section value when the user pressed a key that is not a navigation key (arrow key for example).
 * This hook has two main editing behaviors
 *
 * 1. The numeric editing when the user presses a digit
 * 2. The letter editing when the user presses another key
 */
export declare const useFieldCharacterEditing: <TValue extends PickerValidValue>({
  stateResponse: {
    localizedDigits,
    sectionsValueBoundaries,
    state,
    timezone,
    setCharacterQuery,
    setTempAndroidValueStr,
    updateSectionValue
  }
}: UseFieldCharacterEditingParameters<TValue>) => UseFieldCharacterEditingReturnValue;
export interface ApplyCharacterEditingParameters {
  keyPressed: string;
  sectionIndex: number;
}
interface UseFieldCharacterEditingParameters<TValue extends PickerValidValue> {
  stateResponse: UseFieldStateReturnValue<TValue>;
}
export type UseFieldCharacterEditingReturnValue = (params: ApplyCharacterEditingParameters) => void;
export {};
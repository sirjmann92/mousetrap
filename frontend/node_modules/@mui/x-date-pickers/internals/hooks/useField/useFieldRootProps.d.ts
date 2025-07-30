import { PickerManager } from "../../../models/index.js";
import { UseFieldDOMGetters, UseFieldInternalProps } from "./useField.types.js";
import { UseFieldStateReturnValue } from "./useFieldState.js";
import { UseFieldCharacterEditingReturnValue } from "./useFieldCharacterEditing.js";
/**
 * Generate the props to pass to the root element of the field.
 * It is not used by the non-accessible DOM structure (with an <input /> element for editing).
 * It should be used in the MUI accessible DOM structure and the Base UI implementation.
 * @param {UseFieldRootPropsParameters} parameters The parameters of the hook.
 * @returns {UseFieldRootPropsReturnValue} The props to forward to the root element of the field.
 */
export declare function useFieldRootProps(parameters: UseFieldRootPropsParameters): UseFieldRootPropsReturnValue;
interface UseFieldRootPropsParameters {
  manager: PickerManager<any, any, any, any, any>;
  stateResponse: UseFieldStateReturnValue<any>;
  applyCharacterEditing: UseFieldCharacterEditingReturnValue;
  internalPropsWithDefaults: UseFieldInternalProps<any, any, any>;
  domGetters: UseFieldDOMGetters;
  focused: boolean;
  setFocused: (focused: boolean) => void;
}
interface UseFieldRootPropsReturnValue {
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  onBlur: React.FocusEventHandler<HTMLDivElement>;
  onFocus: React.FocusEventHandler<HTMLDivElement>;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onPaste: React.ClipboardEventHandler<HTMLDivElement>;
  onInput: React.FormEventHandler<HTMLDivElement>;
  contentEditable: boolean;
  tabIndex: number;
}
export {};
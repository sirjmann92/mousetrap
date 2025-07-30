import { UseFieldParameters, UseFieldProps, UseFieldReturnValue } from "./useField.types.js";
import { InferFieldSection } from "../../../models/index.js";
import { PickerValidValue } from "../../models/index.js";
export declare const addPositionPropertiesToSections: <TValue extends PickerValidValue>(sections: InferFieldSection<TValue>[], localizedDigits: string[], isRtl: boolean) => FieldSectionWithPositions<TValue>[];
export declare const useFieldV6TextField: <TValue extends PickerValidValue, TError, TValidationProps extends {}, TProps extends UseFieldProps<false>>(parameters: UseFieldParameters<TValue, false, TError, TValidationProps, TProps>) => UseFieldReturnValue<false, TProps>;
type FieldSectionWithPositions<TValue extends PickerValidValue> = InferFieldSection<TValue> & {
  /**
   * Start index of the section in the format
   */
  start: number;
  /**
   * End index of the section in the format
   */
  end: number;
  /**
   * Start index of the section value in the input.
   * Takes into account invisible unicode characters such as \u2069 but does not include them
   */
  startInInput: number;
  /**
   * End index of the section value in the input.
   * Takes into account invisible unicode characters such as \u2069 but does not include them
   */
  endInInput: number;
};
export {};
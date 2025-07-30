import { UseFieldInternalProps, UseFieldState, FieldParsedSelectedSections, FieldSectionsValueBoundaries, SectionOrdering, UseFieldForwardedProps, CharacterEditingQuery } from "./useField.types.js";
import { FieldSelectedSections, PickersTimezone, InferFieldSection, PickerManager } from "../../../models/index.js";
import { PickerValidValue } from "../../models/index.js";
export declare const useFieldState: <TValue extends PickerValidValue, TEnableAccessibleFieldDOMStructure extends boolean, TError, TValidationProps extends {}, TForwardedProps extends UseFieldForwardedProps<TEnableAccessibleFieldDOMStructure>>(parameters: UseFieldStateParameters<TValue, TEnableAccessibleFieldDOMStructure, TError, TValidationProps, TForwardedProps>) => UseFieldStateReturnValue<TValue>;
interface UseFieldStateParameters<TValue extends PickerValidValue, TEnableAccessibleFieldDOMStructure extends boolean, TError, TValidationProps extends {}, TForwardedProps extends UseFieldForwardedProps<TEnableAccessibleFieldDOMStructure>> {
  manager: PickerManager<TValue, TEnableAccessibleFieldDOMStructure, TError, TValidationProps, any>;
  internalPropsWithDefaults: UseFieldInternalProps<TValue, TEnableAccessibleFieldDOMStructure, TError> & TValidationProps;
  forwardedProps: TForwardedProps;
}
export interface UpdateSectionValueParameters<TValue extends PickerValidValue> {
  /**
   * The section on which we want to apply the new value.
   */
  section: InferFieldSection<TValue>;
  /**
   * Value to apply to the active section.
   */
  newSectionValue: string;
  /**
   * If `true`, the focus will move to the next section.
   */
  shouldGoToNextSection: boolean;
}
export interface UseFieldStateReturnValue<TValue extends PickerValidValue> {
  activeSectionIndex: number | null;
  areAllSectionsEmpty: boolean;
  error: boolean;
  localizedDigits: string[];
  parsedSelectedSections: FieldParsedSelectedSections;
  sectionOrder: SectionOrdering;
  sectionsValueBoundaries: FieldSectionsValueBoundaries;
  state: UseFieldState<TValue>;
  timezone: PickersTimezone;
  value: TValue;
  clearValue: () => void;
  clearActiveSection: () => void;
  setCharacterQuery: (characterQuery: CharacterEditingQuery | null) => void;
  setSelectedSections: (sections: FieldSelectedSections) => void;
  setTempAndroidValueStr: (tempAndroidValueStr: string | null) => void;
  updateSectionValue: (parameters: UpdateSectionValueParameters<TValue>) => void;
  updateValueFromValueStr: (valueStr: string) => void;
  getSectionsFromValue: (value: TValue, fallbackSections?: InferFieldSection<TValue>[] | null) => InferFieldSection<TValue>[];
}
export {};
import { MakeOptional } from '@mui/x-internals/types';
import { DateValidationError, BuiltInFieldTextFieldProps } from "../models/index.js";
import { UseFieldInternalProps } from "../internals/hooks/useField/index.js";
import { ExportedValidateDateProps } from "../validation/validateDate.js";
import { PickerValue } from "../internals/models/index.js";
import { ExportedPickerFieldUIProps, PickerFieldUISlotProps, PickerFieldUISlots } from "../internals/components/PickerFieldUI.js";
export interface UseDateFieldProps<TEnableAccessibleFieldDOMStructure extends boolean> extends MakeOptional<UseFieldInternalProps<PickerValue, TEnableAccessibleFieldDOMStructure, DateValidationError>, 'format'>, ExportedValidateDateProps, ExportedPickerFieldUIProps {}
export type DateFieldProps<TEnableAccessibleFieldDOMStructure extends boolean = true> = UseDateFieldProps<TEnableAccessibleFieldDOMStructure> & Omit<BuiltInFieldTextFieldProps<TEnableAccessibleFieldDOMStructure>, keyof UseDateFieldProps<TEnableAccessibleFieldDOMStructure>> & {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: DateFieldSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: DateFieldSlotProps;
};
export type DateFieldOwnerState<TEnableAccessibleFieldDOMStructure extends boolean> = DateFieldProps<TEnableAccessibleFieldDOMStructure>;
export interface DateFieldSlots extends PickerFieldUISlots {}
export interface DateFieldSlotProps extends PickerFieldUISlotProps {}
import { MakeOptional } from '@mui/x-internals/types';
import { DateTimeValidationError, BuiltInFieldTextFieldProps } from "../models/index.js";
import { UseFieldInternalProps } from "../internals/hooks/useField/index.js";
import { ExportedValidateDateTimeProps } from "../validation/validateDateTime.js";
import { AmPmProps } from "../internals/models/props/time.js";
import { PickerValue } from "../internals/models/index.js";
import { ExportedPickerFieldUIProps, PickerFieldUISlotProps, PickerFieldUISlots } from "../internals/components/PickerFieldUI.js";
export interface UseDateTimeFieldProps<TEnableAccessibleFieldDOMStructure extends boolean> extends MakeOptional<UseFieldInternalProps<PickerValue, TEnableAccessibleFieldDOMStructure, DateTimeValidationError>, 'format'>, ExportedValidateDateTimeProps, ExportedPickerFieldUIProps, AmPmProps {}
export type DateTimeFieldProps<TEnableAccessibleFieldDOMStructure extends boolean = true> = UseDateTimeFieldProps<TEnableAccessibleFieldDOMStructure> & Omit<BuiltInFieldTextFieldProps<TEnableAccessibleFieldDOMStructure>, keyof UseDateTimeFieldProps<TEnableAccessibleFieldDOMStructure>> & {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: DateTimeFieldSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: DateTimeFieldSlotProps;
};
export interface DateTimeFieldSlots extends PickerFieldUISlots {}
export interface DateTimeFieldSlotProps extends PickerFieldUISlotProps {}
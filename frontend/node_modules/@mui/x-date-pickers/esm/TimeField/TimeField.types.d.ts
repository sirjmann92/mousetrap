import { MakeOptional } from '@mui/x-internals/types';
import { UseFieldInternalProps } from "../internals/hooks/useField/index.js";
import { TimeValidationError, BuiltInFieldTextFieldProps } from "../models/index.js";
import { ExportedValidateTimeProps } from "../validation/validateTime.js";
import { AmPmProps } from "../internals/models/props/time.js";
import { PickerValue } from "../internals/models/index.js";
import { ExportedPickerFieldUIProps, PickerFieldUISlotProps, PickerFieldUISlots } from "../internals/components/PickerFieldUI.js";
export interface UseTimeFieldProps<TEnableAccessibleFieldDOMStructure extends boolean> extends MakeOptional<UseFieldInternalProps<PickerValue, TEnableAccessibleFieldDOMStructure, TimeValidationError>, 'format'>, ExportedValidateTimeProps, ExportedPickerFieldUIProps, AmPmProps {}
export type TimeFieldProps<TEnableAccessibleFieldDOMStructure extends boolean = true> = UseTimeFieldProps<TEnableAccessibleFieldDOMStructure> & Omit<BuiltInFieldTextFieldProps<TEnableAccessibleFieldDOMStructure>, keyof UseTimeFieldProps<TEnableAccessibleFieldDOMStructure>> & {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: TimeFieldSlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: TimeFieldSlotProps;
};
export interface TimeFieldSlots extends PickerFieldUISlots {}
export interface TimeFieldSlotProps extends PickerFieldUISlotProps {}
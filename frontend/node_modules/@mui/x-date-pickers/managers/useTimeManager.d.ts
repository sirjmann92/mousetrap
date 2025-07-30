import type { MakeOptional } from '@mui/x-internals/types';
import { PickerManager, TimeValidationError } from "../models/index.js";
import { UseFieldInternalProps } from "../internals/hooks/useField/index.js";
import { AmPmProps } from "../internals/models/props/time.js";
import { ExportedValidateTimeProps, ValidateTimeProps } from "../validation/validateTime.js";
import { PickerValue } from "../internals/models/index.js";
export declare function useTimeManager<TEnableAccessibleFieldDOMStructure extends boolean = true>(parameters?: UseTimeManagerParameters<TEnableAccessibleFieldDOMStructure>): UseTimeManagerReturnValue<TEnableAccessibleFieldDOMStructure>;
type SharedTimeAndTimeRangeValidationProps = 'disablePast' | 'disableFuture';
export declare function useApplyDefaultValuesToTimeValidationProps(props: Pick<ExportedValidateTimeProps, SharedTimeAndTimeRangeValidationProps>): Pick<ValidateTimeProps, SharedTimeAndTimeRangeValidationProps>;
export interface UseTimeManagerParameters<TEnableAccessibleFieldDOMStructure extends boolean> extends AmPmProps {
  enableAccessibleFieldDOMStructure?: TEnableAccessibleFieldDOMStructure;
}
export type UseTimeManagerReturnValue<TEnableAccessibleFieldDOMStructure extends boolean> = PickerManager<PickerValue, TEnableAccessibleFieldDOMStructure, TimeValidationError, ValidateTimeProps, TimeManagerFieldInternalProps<TEnableAccessibleFieldDOMStructure>>;
export interface TimeManagerFieldInternalProps<TEnableAccessibleFieldDOMStructure extends boolean> extends MakeOptional<UseFieldInternalProps<PickerValue, TEnableAccessibleFieldDOMStructure, TimeValidationError>, 'format'>, ExportedValidateTimeProps, AmPmProps {}
export {};
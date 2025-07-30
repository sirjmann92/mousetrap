import type { MakeOptional } from '@mui/x-internals/types';
import { PickerManager, DateTimeValidationError } from "../models/index.js";
import { UseFieldInternalProps } from "../internals/hooks/useField/index.js";
import { AmPmProps } from "../internals/models/props/time.js";
import { ExportedValidateDateTimeProps, ValidateDateTimeProps } from "../validation/validateDateTime.js";
import { PickerValue } from "../internals/models/index.js";
export declare function useDateTimeManager<TEnableAccessibleFieldDOMStructure extends boolean = true>(parameters?: UseDateTimeManagerParameters<TEnableAccessibleFieldDOMStructure>): UseDateTimeManagerReturnValue<TEnableAccessibleFieldDOMStructure>;
type SharedDateTimeAndDateTimeRangeValidationProps = 'disablePast' | 'disableFuture' | 'minTime' | 'maxTime' | 'minDate' | 'maxDate';
export declare function useApplyDefaultValuesToDateTimeValidationProps(props: Pick<ExportedValidateDateTimeProps, SharedDateTimeAndDateTimeRangeValidationProps | 'minDateTime' | 'maxDateTime'>): Pick<ValidateDateTimeProps, SharedDateTimeAndDateTimeRangeValidationProps>;
export interface UseDateTimeManagerParameters<TEnableAccessibleFieldDOMStructure extends boolean> {
  enableAccessibleFieldDOMStructure?: TEnableAccessibleFieldDOMStructure;
}
export type UseDateTimeManagerReturnValue<TEnableAccessibleFieldDOMStructure extends boolean> = PickerManager<PickerValue, TEnableAccessibleFieldDOMStructure, DateTimeValidationError, ValidateDateTimeProps, DateTimeManagerFieldInternalProps<TEnableAccessibleFieldDOMStructure>>;
export interface DateTimeManagerFieldInternalProps<TEnableAccessibleFieldDOMStructure extends boolean> extends MakeOptional<UseFieldInternalProps<PickerValue, TEnableAccessibleFieldDOMStructure, DateTimeValidationError>, 'format'>, ExportedValidateDateTimeProps, AmPmProps {}
export {};
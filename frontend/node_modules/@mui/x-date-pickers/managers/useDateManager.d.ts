import type { MakeOptional } from '@mui/x-internals/types';
import { PickerManager, DateValidationError } from "../models/index.js";
import { UseFieldInternalProps } from "../internals/hooks/useField/index.js";
import { ExportedValidateDateProps, ValidateDateProps } from "../validation/validateDate.js";
import { PickerValue } from "../internals/models/index.js";
export declare function useDateManager<TEnableAccessibleFieldDOMStructure extends boolean = true>(parameters?: UseDateManagerParameters<TEnableAccessibleFieldDOMStructure>): UseDateManagerReturnValue<TEnableAccessibleFieldDOMStructure>;
type SharedDateAndDateRangeValidationProps = 'disablePast' | 'disableFuture' | 'minDate' | 'maxDate';
export declare function useApplyDefaultValuesToDateValidationProps(props: Pick<ExportedValidateDateProps, SharedDateAndDateRangeValidationProps>): Pick<ValidateDateProps, SharedDateAndDateRangeValidationProps>;
export interface UseDateManagerParameters<TEnableAccessibleFieldDOMStructure extends boolean> {
  enableAccessibleFieldDOMStructure?: TEnableAccessibleFieldDOMStructure;
}
export type UseDateManagerReturnValue<TEnableAccessibleFieldDOMStructure extends boolean> = PickerManager<PickerValue, TEnableAccessibleFieldDOMStructure, DateValidationError, ValidateDateProps, DateManagerFieldInternalProps<TEnableAccessibleFieldDOMStructure>>;
export interface DateManagerFieldInternalProps<TEnableAccessibleFieldDOMStructure extends boolean> extends MakeOptional<UseFieldInternalProps<PickerValue, TEnableAccessibleFieldDOMStructure, DateValidationError>, 'format'>, ExportedValidateDateProps {}
export {};
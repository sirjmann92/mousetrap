import { Validator } from "./useValidation.js";
import { ExportedValidateDateProps, ValidateDateProps, ValidateDatePropsToDefault } from "./validateDate.js";
import { ExportedValidateTimeProps, ValidateTimeProps, ValidateTimePropsToDefault } from "./validateTime.js";
import { DateTimeValidationError } from "../models/index.js";
import { DateTimeValidationProps } from "../internals/models/validation.js";
import { PickerValue } from "../internals/models/index.js";
/**
 * Validation props used by the Date Time Picker and Date Time Field components.
 */
export interface ExportedValidateDateTimeProps extends ExportedValidateDateProps, ExportedValidateTimeProps, DateTimeValidationProps {}
/**
 * Validation props as received by the validateDateTime method.
 */
export interface ValidateDateTimeProps extends ValidateDateProps, ValidateTimeProps {}
/**
 * Name of the props that should be defaulted before being passed to the validateDateTime method.
 */
export type ValidateDateTimePropsToDefault = ValidateDatePropsToDefault | ValidateTimePropsToDefault;
export declare const validateDateTime: Validator<PickerValue, DateTimeValidationError, ValidateDateTimeProps>;
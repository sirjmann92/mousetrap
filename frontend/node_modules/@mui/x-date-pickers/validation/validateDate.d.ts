import type { MakeRequired } from '@mui/x-internals/types';
import { Validator } from "./useValidation.js";
import { BaseDateValidationProps, DayValidationProps, MonthValidationProps, YearValidationProps } from "../internals/models/validation.js";
import { DateValidationError } from "../models/index.js";
import { PickerValue } from "../internals/models/index.js";
/**
 * Validation props used by the Date Picker, Date Field and Date Calendar components.
 */
export interface ExportedValidateDateProps extends DayValidationProps, MonthValidationProps, YearValidationProps, BaseDateValidationProps {}
/**
 * Validation props as received by the validateDate method.
 */
export interface ValidateDateProps extends MakeRequired<ExportedValidateDateProps, ValidateDatePropsToDefault> {}
/**
 * Name of the props that should be defaulted before being passed to the validateDate method.
 */
export type ValidateDatePropsToDefault = keyof BaseDateValidationProps;
export declare const validateDate: Validator<PickerValue, DateValidationError, ValidateDateProps>;
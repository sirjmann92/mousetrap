import type { MakeRequired } from '@mui/x-internals/types';
import { Validator } from "./useValidation.js";
import { BaseTimeValidationProps, TimeValidationProps } from "../internals/models/validation.js";
import { TimeValidationError } from "../models/index.js";
import { PickerValue } from "../internals/models/index.js";
/**
 * Validation props used by the Time Picker, Time Field and Clock components.
 */
export interface ExportedValidateTimeProps extends BaseTimeValidationProps, TimeValidationProps {}
/**
 * Validation props as received by the validateTime method.
 */
export interface ValidateTimeProps extends MakeRequired<ExportedValidateTimeProps, ValidateTimePropsToDefault> {}
/**
 * Name of the props that should be defaulted before being passed to the validateTime method.
 */
export type ValidateTimePropsToDefault = keyof BaseTimeValidationProps;
export declare const validateTime: Validator<PickerValue, TimeValidationError, ValidateTimeProps>;
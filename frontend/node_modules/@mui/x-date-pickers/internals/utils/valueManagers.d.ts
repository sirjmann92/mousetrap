import type { PickerValueManager } from "../models/index.js";
import { DateValidationError, TimeValidationError, DateTimeValidationError } from "../../models/index.js";
import type { FieldValueManager } from "../hooks/useField/index.js";
import { PickerValue } from "../models/index.js";
export type SingleItemPickerValueManager<TError extends DateValidationError | TimeValidationError | DateTimeValidationError = any> = PickerValueManager<PickerValue, TError>;
export declare const singleItemValueManager: SingleItemPickerValueManager;
export declare const singleItemFieldValueManager: FieldValueManager<PickerValue>;
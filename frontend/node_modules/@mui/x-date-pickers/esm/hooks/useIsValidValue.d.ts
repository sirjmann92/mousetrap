import * as React from 'react';
import { PickerValidValue } from "../internals/models/index.js";
export declare const IsValidValueContext: React.Context<(value: any) => boolean>;
/**
 * Returns a function to check if a value is valid according to the validation props passed to the parent Picker.
 */
export declare function useIsValidValue<TValue extends PickerValidValue>(): (value: TValue) => boolean;
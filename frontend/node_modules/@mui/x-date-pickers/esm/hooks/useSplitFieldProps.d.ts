import { DATE_TIME_VALIDATION_PROP_NAMES, DATE_VALIDATION_PROP_NAMES, TIME_VALIDATION_PROP_NAMES } from "../validation/extractValidationProps.js";
import { PickerValueType } from "../models/common.js";
declare const SHARED_FIELD_INTERNAL_PROP_NAMES: readonly ["value", "defaultValue", "referenceDate", "format", "formatDensity", "onChange", "timezone", "onError", "shouldRespectLeadingZeros", "selectedSections", "onSelectedSectionsChange", "unstableFieldRef", "unstableStartFieldRef", "unstableEndFieldRef", "enableAccessibleFieldDOMStructure", "disabled", "readOnly", "dateSeparator", "autoFocus", "focused"];
export type InternalPropNames<TValueType extends PickerValueType> = (typeof SHARED_FIELD_INTERNAL_PROP_NAMES)[number] | (TValueType extends 'date' | 'date-time' ? (typeof DATE_VALIDATION_PROP_NAMES)[number] : never) | (TValueType extends 'time' | 'date-time' ? (typeof TIME_VALIDATION_PROP_NAMES)[number] : never) | (TValueType extends 'date-time' ? (typeof DATE_TIME_VALIDATION_PROP_NAMES)[number] : never);
/**
 * Split the props received by the field component into:
 * - `internalProps` which are used by the various hooks called by the field component.
 * - `forwardedProps` which are passed to the underlying component.
 * Note that some forwarded props might be used by the hooks as well.
 * For instance, hooks like `useDateField` need props like `onKeyDown` to merge the default event handler and the one provided by the application.
 * @template TProps, TValueType
 * @param {TProps} props The props received by the field component.
 * @param {TValueType} valueType The type of the field value ('date', 'time', or 'date-time').
 */
export declare const useSplitFieldProps: <TValueType extends PickerValueType, TProps extends { [key in InternalPropNames<TValueType>]?: any }>(props: TProps, valueType: TValueType) => {
  forwardedProps: Omit<TProps, InternalPropNames<TValueType>>;
  internalProps: ExtractInternalProps<TValueType, TProps>;
};
/**
 * Extract the internal props from the props received by the field component.
 * This makes sure that the internal props not defined in the props are not present in the result.
 */
type ExtractInternalProps<TValueType extends PickerValueType, TProps extends { [key in InternalPropNames<TValueType>]?: any }> = { [K in keyof TProps]: K extends InternalPropNames<TValueType> ? TProps[K] : never };
export {};
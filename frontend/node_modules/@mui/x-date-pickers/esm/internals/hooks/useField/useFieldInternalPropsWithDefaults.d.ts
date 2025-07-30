import { PickerAnyManager, PickerManagerFieldInternalProps, PickerManagerFieldInternalPropsWithDefaults } from "../../models/index.js";
/**
 * Applies the default values to the field internal props.
 * This is a temporary hook that will be removed during a follow up when `useField` will receive the internal props without the defaults.
 * It is only here to allow the migration to be done in smaller steps.
 */
export declare function useFieldInternalPropsWithDefaults<TManager extends PickerAnyManager>(parameters: UseFieldInternalPropsWithDefaultsParameters<TManager>): PickerManagerFieldInternalPropsWithDefaults<TManager>;
interface UseFieldInternalPropsWithDefaultsParameters<TManager extends PickerAnyManager> {
  manager: TManager;
  internalProps: PickerManagerFieldInternalProps<TManager>;
  /**
   * Hack to make sure that on multi input range field, the `useNullableFieldPrivateContext().fieldRef` is only bound to the field matching the range position.
   * @default false
   */
  skipContextFieldRefAssignment?: boolean;
}
export {};
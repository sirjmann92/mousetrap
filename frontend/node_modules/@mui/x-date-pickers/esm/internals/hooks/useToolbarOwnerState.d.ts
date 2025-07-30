import { PickerOwnerState } from "../../models/index.js";
export declare function useToolbarOwnerState(): PickerToolbarOwnerState;
export interface PickerToolbarOwnerState extends PickerOwnerState {
  /**
   * The direction of the toolbar.
   * Is equal to "ltr" when the toolbar is in left-to-right direction.
   * Is equal to "rtl" when the toolbar is in right-to-left direction.
   */
  toolbarDirection: 'ltr' | 'rtl';
}
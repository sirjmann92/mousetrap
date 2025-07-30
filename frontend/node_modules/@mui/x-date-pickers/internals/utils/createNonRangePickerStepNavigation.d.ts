import { DateOrTimeViewWithMeridiem } from "../models/common.js";
export declare function createNonRangePickerStepNavigation(parameters: CreateNonRangePickerStepNavigationParameters): import("./createStepNavigation.js").CreateStepNavigationReturnValue;
export interface PickerStep {
  /**
   * The views that are handled inside this step.
   * If null, all views are handled by this step.
   */
  views: readonly DateOrTimeViewWithMeridiem[] | null;
}
interface CreateNonRangePickerStepNavigationParameters {
  steps: PickerStep[] | null;
}
export {};
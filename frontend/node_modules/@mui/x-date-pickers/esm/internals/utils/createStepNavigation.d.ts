import { DateOrTimeViewWithMeridiem } from "../models/index.js";
export declare const DEFAULT_STEP_NAVIGATION: {
  hasNextStep: boolean;
  hasSeveralSteps: boolean;
  goToNextStep: () => void;
  areViewsInSameStep: () => boolean;
};
/**
 * Create an object that determines whether there is a next step and allows to go to the next step.
 * @param {CreateStepNavigationParameters<TStep>} parameters The parameters of the createStepNavigation function
 * @returns {CreateStepNavigationReturnValue} The return value of the createStepNavigation function
 */
export declare function createStepNavigation<TStep extends {}>(parameters: CreateStepNavigationParameters<TStep>): CreateStepNavigationReturnValue;
interface CreateStepNavigationParameters<TStep extends {}> {
  steps: TStep[] | null;
  isViewMatchingStep: (view: DateOrTimeViewWithMeridiem, step: TStep) => boolean;
  onStepChange: (parameters: UseRangePickerStepNavigationOnStepChangeParameters<TStep>) => void;
}
export type CreateStepNavigationReturnValue = (parameters: CreateStepNavigationReturnValueParameters) => {
  /**
   * Whether there is a next step.
   */
  hasNextStep: boolean;
  /**
   * Whether there are several steps.
   */
  hasSeveralSteps: boolean;
  /**
   * Go to the next step if any.
   */
  goToNextStep: () => void;
  /**
   * Whether the two views are in the same step.
   * @param {DateOrTimeViewWithMeridiem} viewA The first view to compare.
   * @param {DateOrTimeViewWithMeridiem} viewB The second view to compare.
   * @returns {boolean} Whether the two views are in the same step.
   */
  areViewsInSameStep: (viewA: DateOrTimeViewWithMeridiem, viewB: DateOrTimeViewWithMeridiem) => boolean;
};
export interface CreateStepNavigationReturnValueParameters {
  defaultView: DateOrTimeViewWithMeridiem;
  view: DateOrTimeViewWithMeridiem;
  views: readonly DateOrTimeViewWithMeridiem[];
  setView: (view: any) => void;
}
interface UseRangePickerStepNavigationOnStepChangeParameters<TStep extends {}> extends CreateStepNavigationReturnValueParameters {
  step: TStep;
}
export {};
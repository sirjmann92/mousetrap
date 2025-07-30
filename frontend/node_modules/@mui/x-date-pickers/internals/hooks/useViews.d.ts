import { MakeOptional } from '@mui/x-internals/types';
import type { PickerSelectionState } from "./usePicker/index.js";
import { DateOrTimeViewWithMeridiem, PickerValidValue } from "../models/index.js";
import { PickerValidDate } from "../../models/index.js";
import { CreateStepNavigationReturnValue } from "../utils/createStepNavigation.js";
export type PickerOnChangeFn = (date: PickerValidDate | null, selectionState?: PickerSelectionState) => void;
export interface UseViewsOptions<TValue extends PickerValidValue, TView extends DateOrTimeViewWithMeridiem> {
  /**
   * Callback fired when the value changes.
   * @template TValue The value type. It will be the same type as `value` or `null`. It can be in `[start, end]` format in case of range value.
   * @template TView The view type. Will be one of date or time views.
   * @param {TValue} value The new value.
   * @param {PickerSelectionState | undefined} selectionState Indicates if the date selection is complete.
   * @param {TView | undefined} selectedView Indicates the view in which the selection has been made.
   */
  onChange: (value: TValue, selectionState?: PickerSelectionState, selectedView?: TView) => void;
  /**
   * Callback fired on view change.
   * @template TView Type of the view. It will vary based on the Picker type and the `views` it uses.
   * @param {TView} view The new view.
   */
  onViewChange?: (view: TView) => void;
  /**
   * The default visible view.
   * Used when the component view is not controlled.
   * Must be a valid option from `views` list.
   */
  openTo?: TView;
  /**
   * The visible view.
   * Used when the component view is controlled.
   * Must be a valid option from `views` list.
   */
  view?: TView;
  /**
   * Available views.
   */
  views: readonly TView[];
  /**
   * If `true`, the main element is focused during the first mount.
   * This main element is:
   * - the element chosen by the visible view if any (i.e: the selected day on the `day` view).
   * - the `input` element if there is a field rendered.
   */
  autoFocus?: boolean;
  /**
   * Controlled focused view.
   */
  focusedView?: TView | null;
  /**
   * Callback fired on focused view change.
   * @template TView Type of the view. It will vary based on the Picker type and the `views` it uses.
   * @param {TView} view The new view to focus or not.
   * @param {boolean} hasFocus `true` if the view should be focused.
   */
  onFocusedViewChange?: (view: TView, hasFocus: boolean) => void;
  getStepNavigation?: CreateStepNavigationReturnValue;
}
export interface ExportedUseViewsOptions<TValue extends PickerValidValue, TView extends DateOrTimeViewWithMeridiem> extends Omit<MakeOptional<UseViewsOptions<TValue, TView>, 'onChange' | 'openTo' | 'views'>, 'getStepNavigation'> {}
interface UseViewsResponse<TValue extends PickerValidValue, TView extends DateOrTimeViewWithMeridiem> {
  view: TView;
  setView: (view: TView) => void;
  focusedView: TView | null;
  setFocusedView: (view: TView, hasFocus: boolean) => void;
  nextView: TView | null;
  previousView: TView | null;
  defaultView: TView;
  goToNextView: () => void;
  setValueAndGoToNextView: (value: TValue, currentViewSelectionState?: PickerSelectionState, selectedView?: TView) => void;
  hasNextStep: boolean;
  hasSeveralSteps: boolean;
  goToNextStep: () => void;
}
export declare function useViews<TValue extends PickerValidValue, TView extends DateOrTimeViewWithMeridiem>({
  onChange,
  onViewChange,
  openTo,
  view: inView,
  views,
  autoFocus,
  focusedView: inFocusedView,
  onFocusedViewChange,
  getStepNavigation
}: UseViewsOptions<TValue, TView>): UseViewsResponse<TValue, TView>;
export {};
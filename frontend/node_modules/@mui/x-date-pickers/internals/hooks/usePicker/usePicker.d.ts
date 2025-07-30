import { UsePickerParameters, UsePickerProps, UsePickerReturnValue } from "./usePicker.types.js";
import { DateOrTimeViewWithMeridiem, PickerValidValue } from "../../models/index.js";
export declare const usePicker: <TValue extends PickerValidValue, TView extends DateOrTimeViewWithMeridiem, TExternalProps extends UsePickerProps<TValue, TView, any, any>>({
  ref,
  props,
  valueManager,
  valueType,
  variant,
  validator,
  onPopperExited,
  autoFocusView,
  rendererInterceptor: RendererInterceptor,
  localeText,
  viewContainerRole,
  getStepNavigation
}: UsePickerParameters<TValue, TView, TExternalProps>) => UsePickerReturnValue<TValue>;
import { DefaultizedProps } from '@mui/x-internals/types';
import { DateOrTimeView, MuiPickersAdapter } from "../../models/index.js";
import { DateOrTimeViewWithMeridiem } from "../models/index.js";
import { DigitalTimePickerProps } from "../models/props/time.js";
export declare const resolveDateTimeFormat: (adapter: MuiPickersAdapter, {
  views,
  format,
  ...other
}: {
  format?: string;
  views: readonly DateOrTimeViewWithMeridiem[];
  ampm: boolean;
}, ignoreDateResolving?: boolean) => string;
interface DefaultizedTimeViewsProps<TView = DateOrTimeView> extends DefaultizedProps<DigitalTimePickerProps, 'ampm'> {
  views: readonly TView[];
}
interface DefaultizedTimeViewsResponse<TView = DateOrTimeViewWithMeridiem> extends Required<Pick<DefaultizedTimeViewsProps<TView>, 'thresholdToRenderTimeInASingleColumn' | 'timeSteps' | 'views'>> {
  shouldRenderTimeInASingleColumn: boolean;
}
export declare function resolveTimeViewsResponse<InTView extends DateOrTimeView = DateOrTimeView, OutTView extends DateOrTimeViewWithMeridiem = DateOrTimeViewWithMeridiem>({
  thresholdToRenderTimeInASingleColumn: inThreshold,
  ampm,
  timeSteps: inTimeSteps,
  views
}: DefaultizedTimeViewsProps<InTView>): DefaultizedTimeViewsResponse<OutTView>;
export {};
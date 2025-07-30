import { DateOrTimeViewWithMeridiem } from "../models/index.js";
export declare const areViewsEqual: <TView extends DateOrTimeViewWithMeridiem>(views: ReadonlyArray<DateOrTimeViewWithMeridiem>, expectedViews: TView[]) => views is ReadonlyArray<TView>;
export declare const applyDefaultViewProps: <TView extends DateOrTimeViewWithMeridiem>({
  openTo,
  defaultOpenTo,
  views,
  defaultViews
}: {
  openTo: TView | undefined;
  defaultOpenTo: TView;
  views: readonly TView[] | undefined;
  defaultViews: readonly TView[];
}) => {
  views: readonly TView[];
  openTo: TView;
};
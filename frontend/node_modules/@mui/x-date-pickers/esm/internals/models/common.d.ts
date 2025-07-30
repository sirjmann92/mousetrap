import { DateView, TimeView } from "../../models/views.js";
export type PickerOrientation = 'portrait' | 'landscape';
export type PickerVariant = 'mobile' | 'desktop';
export type TimeViewWithMeridiem = TimeView | 'meridiem';
export type DateOrTimeViewWithMeridiem = DateView | TimeViewWithMeridiem;
import * as React from 'react';
import { useLocalizationContext, usePickerAdapter } from "../../hooks/usePickerAdapter.js";
export const useDefaultDates = () => useLocalizationContext().defaultDates;
export const useNow = timezone => {
  const adapter = usePickerAdapter();
  const now = React.useRef(undefined);
  if (now.current === undefined) {
    now.current = adapter.date(undefined, timezone);
  }
  return now.current;
};
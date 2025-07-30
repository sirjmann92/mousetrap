import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';
import { usePickerAdapter } from "../hooks/usePickerAdapter.js";
import { DateTimePickerTabs } from "./DateTimePickerTabs.js";
import { DateTimePickerToolbar } from "./DateTimePickerToolbar.js";
import { applyDefaultViewProps } from "../internals/utils/views.js";
import { resolveTimeViewsResponse } from "../internals/utils/date-time-utils.js";
import { useApplyDefaultValuesToDateTimeValidationProps } from "../managers/useDateTimeManager.js";
export function useDateTimePickerDefaultizedProps(props, name) {
  const adapter = usePickerAdapter();
  const themeProps = useThemeProps({
    props,
    name
  });
  const validationProps = useApplyDefaultValuesToDateTimeValidationProps(themeProps);
  const ampm = themeProps.ampm ?? adapter.is12HourCycleInCurrentLocale();
  const localeText = React.useMemo(() => {
    if (themeProps.localeText?.toolbarTitle == null) {
      return themeProps.localeText;
    }
    return _extends({}, themeProps.localeText, {
      dateTimePickerToolbarTitle: themeProps.localeText.toolbarTitle
    });
  }, [themeProps.localeText]);
  const {
    openTo,
    views: defaultViews
  } = applyDefaultViewProps({
    views: themeProps.views,
    openTo: themeProps.openTo,
    defaultViews: ['year', 'day', 'hours', 'minutes'],
    defaultOpenTo: 'day'
  });
  const {
    shouldRenderTimeInASingleColumn,
    thresholdToRenderTimeInASingleColumn,
    views,
    timeSteps
  } = resolveTimeViewsResponse({
    thresholdToRenderTimeInASingleColumn: themeProps.thresholdToRenderTimeInASingleColumn,
    ampm,
    timeSteps: themeProps.timeSteps,
    views: defaultViews
  });
  return _extends({}, themeProps, validationProps, {
    timeSteps,
    openTo,
    shouldRenderTimeInASingleColumn,
    thresholdToRenderTimeInASingleColumn,
    views,
    ampm,
    localeText,
    orientation: themeProps.orientation ?? 'portrait',
    slots: _extends({
      toolbar: DateTimePickerToolbar,
      tabs: DateTimePickerTabs
    }, themeProps.slots),
    slotProps: _extends({}, themeProps.slotProps, {
      toolbar: _extends({
        ampm
      }, themeProps.slotProps?.toolbar)
    })
  });
}
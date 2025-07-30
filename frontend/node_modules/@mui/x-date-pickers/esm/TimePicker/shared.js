import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useThemeProps } from '@mui/material/styles';
import { TimePickerToolbar } from "./TimePickerToolbar.js";
import { applyDefaultViewProps } from "../internals/utils/views.js";
import { useApplyDefaultValuesToTimeValidationProps } from "../managers/useTimeManager.js";
import { usePickerAdapter } from "../hooks/usePickerAdapter.js";
export function useTimePickerDefaultizedProps(props, name) {
  const adapter = usePickerAdapter();
  const themeProps = useThemeProps({
    props,
    name
  });
  const validationProps = useApplyDefaultValuesToTimeValidationProps(themeProps);
  const ampm = themeProps.ampm ?? adapter.is12HourCycleInCurrentLocale();
  const localeText = React.useMemo(() => {
    if (themeProps.localeText?.toolbarTitle == null) {
      return themeProps.localeText;
    }
    return _extends({}, themeProps.localeText, {
      timePickerToolbarTitle: themeProps.localeText.toolbarTitle
    });
  }, [themeProps.localeText]);
  return _extends({}, themeProps, validationProps, {
    ampm,
    localeText
  }, applyDefaultViewProps({
    views: themeProps.views,
    openTo: themeProps.openTo,
    defaultViews: ['hours', 'minutes'],
    defaultOpenTo: 'hours'
  }), {
    slots: _extends({
      toolbar: TimePickerToolbar
    }, themeProps.slots),
    slotProps: _extends({}, themeProps.slotProps, {
      toolbar: _extends({
        ampm,
        ampmInClock: themeProps.ampmInClock
      }, themeProps.slotProps?.toolbar)
    })
  });
}
import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useRtl } from '@mui/system/RtlProvider';
import { usePickerPrivateContext } from "./usePickerPrivateContext.js";
export function useToolbarOwnerState() {
  const {
    ownerState: pickerOwnerState
  } = usePickerPrivateContext();
  const isRtl = useRtl();
  return React.useMemo(() => _extends({}, pickerOwnerState, {
    toolbarDirection: isRtl ? 'rtl' : 'ltr'
  }), [pickerOwnerState, isRtl]);
}
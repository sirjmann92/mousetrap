import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useRtl } from '@mui/system/RtlProvider';
import { usePickerPrivateContext } from "./usePickerPrivateContext.js";
export function useFieldOwnerState(parameters) {
  const {
    ownerState: pickerOwnerState
  } = usePickerPrivateContext();
  const isRtl = useRtl();
  return React.useMemo(() => _extends({}, pickerOwnerState, {
    isFieldDisabled: parameters.disabled ?? false,
    isFieldReadOnly: parameters.readOnly ?? false,
    isFieldRequired: parameters.required ?? false,
    fieldDirection: isRtl ? 'rtl' : 'ltr'
  }), [pickerOwnerState, parameters.disabled, parameters.readOnly, parameters.required, isRtl]);
}
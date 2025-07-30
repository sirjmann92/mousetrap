'use client';

import * as React from 'react';
export const PickerTextFieldOwnerStateContext = /*#__PURE__*/React.createContext(null);
if (process.env.NODE_ENV !== "production") PickerTextFieldOwnerStateContext.displayName = "PickerTextFieldOwnerStateContext";
export const usePickerTextFieldOwnerState = () => {
  const value = React.useContext(PickerTextFieldOwnerStateContext);
  if (value == null) {
    throw new Error(['MUI X: The `usePickerTextFieldOwnerState` can only be called in components that are used inside a PickerTextField component'].join('\n'));
  }
  return value;
};
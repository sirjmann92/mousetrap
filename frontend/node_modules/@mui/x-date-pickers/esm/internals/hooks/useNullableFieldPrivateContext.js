'use client';

import * as React from 'react';
export const PickerFieldPrivateContext = /*#__PURE__*/React.createContext(null);
if (process.env.NODE_ENV !== "production") PickerFieldPrivateContext.displayName = "PickerFieldPrivateContext";
export function useNullableFieldPrivateContext() {
  return React.useContext(PickerFieldPrivateContext);
}
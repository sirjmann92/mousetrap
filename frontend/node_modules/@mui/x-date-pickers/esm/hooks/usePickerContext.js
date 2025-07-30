'use client';

import * as React from 'react';
export const PickerContext = /*#__PURE__*/React.createContext(null);

/**
 * Returns the context passed by the Picker wrapping the current component.
 */
if (process.env.NODE_ENV !== "production") PickerContext.displayName = "PickerContext";
export const usePickerContext = () => {
  const value = React.useContext(PickerContext);
  if (value == null) {
    throw new Error('MUI X: The `usePickerContext` hook can only be called inside the context of a Picker component');
  }
  return value;
};
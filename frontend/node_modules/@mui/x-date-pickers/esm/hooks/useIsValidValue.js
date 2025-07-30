'use client';

import * as React from 'react';
export const IsValidValueContext = /*#__PURE__*/React.createContext(() => true);

/**
 * Returns a function to check if a value is valid according to the validation props passed to the parent Picker.
 */
if (process.env.NODE_ENV !== "production") IsValidValueContext.displayName = "IsValidValueContext";
export function useIsValidValue() {
  return React.useContext(IsValidValueContext);
}
'use client';

import * as React from 'react';
import { PickerContext } from "../../hooks/usePickerContext.js";

/**
 * Returns the context passed by the Picker wrapping the current component.
 * If the context is not found, returns `null`.
 */
export const useNullablePickerContext = () => React.useContext(PickerContext);
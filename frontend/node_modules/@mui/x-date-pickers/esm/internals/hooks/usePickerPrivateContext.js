'use client';

import * as React from 'react';
import { PickerPrivateContext } from "../components/PickerProvider.js";

/**
 * Returns the private context passed by the Picker wrapping the current component.
 */
export const usePickerPrivateContext = () => React.useContext(PickerPrivateContext);
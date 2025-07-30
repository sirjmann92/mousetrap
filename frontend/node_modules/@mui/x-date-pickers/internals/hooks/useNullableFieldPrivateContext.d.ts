import * as React from 'react';
import type { UseFieldInternalProps } from "./useField/index.js";
import { FieldRef } from "../../models/index.js";
import { PickerRangeValue, PickerValue } from "../models/index.js";
export declare const PickerFieldPrivateContext: React.Context<PickerFieldPrivateContextValue | null>;
export declare function useNullableFieldPrivateContext(): PickerFieldPrivateContextValue | null;
export interface PickerFieldPrivateContextValue extends Pick<UseFieldInternalProps<any, any, any>, 'formatDensity' | 'enableAccessibleFieldDOMStructure' | 'selectedSections' | 'onSelectedSectionsChange'> {
  fieldRef: React.RefObject<FieldRef<PickerValue> | FieldRef<PickerRangeValue> | null>;
}
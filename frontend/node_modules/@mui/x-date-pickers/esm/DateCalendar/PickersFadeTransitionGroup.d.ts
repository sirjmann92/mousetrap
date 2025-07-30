import * as React from 'react';
import { PickersFadeTransitionGroupClasses } from "./pickersFadeTransitionGroupClasses.js";
export interface ExportedPickersFadeTransitionGroupProps {
  className?: string;
  reduceAnimations: boolean;
  transKey: React.Key;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<PickersFadeTransitionGroupClasses>;
}
export interface PickersFadeTransitionGroupProps extends ExportedPickersFadeTransitionGroupProps {
  children: React.ReactElement<any>;
}
/**
 * @ignore - do not document.
 */
export declare function PickersFadeTransitionGroup(inProps: PickersFadeTransitionGroupProps): React.JSX.Element;
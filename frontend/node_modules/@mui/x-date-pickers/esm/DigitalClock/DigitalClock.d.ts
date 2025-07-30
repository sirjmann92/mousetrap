import * as React from 'react';
import { DigitalClockProps } from "./DigitalClock.types.js";
export declare const DigitalClockItem: import("@emotion/styled").StyledComponent<import("@mui/material/MenuItem").MenuItemOwnProps & Omit<import("@mui/material/ButtonBase").ButtonBaseOwnProps, "classes"> & import("@mui/material/OverridableComponent").CommonProps & Omit<React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "disabled" | "autoFocus" | "dense" | "style" | "tabIndex" | "className" | "children" | "classes" | "sx" | "disableGutters" | "divider" | "action" | "centerRipple" | "disableRipple" | "disableTouchRipple" | "focusRipple" | "focusVisibleClassName" | "LinkComponent" | "onFocusVisible" | "TouchRippleProps" | "touchRippleRef" | "selected"> & import("@mui/system").MUIStyledCommonProps<import("@mui/material/styles").Theme>, {}, {}>;
type DigitalClockComponent = ((props: DigitalClockProps & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
/**
 * Demos:
 *
 * - [TimePicker](https://mui.com/x/react-date-pickers/time-picker/)
 * - [DigitalClock](https://mui.com/x/react-date-pickers/digital-clock/)
 *
 * API:
 *
 * - [DigitalClock API](https://mui.com/x/api/date-pickers/digital-clock/)
 */
export declare const DigitalClock: DigitalClockComponent;
export {};
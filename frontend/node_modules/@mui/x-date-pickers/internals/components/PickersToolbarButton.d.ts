import * as React from 'react';
import { ButtonProps } from '@mui/material/Button';
import { TypographyProps } from '@mui/material/Typography';
import { ExtendMui } from "../models/helpers.js";
import { PickersToolbarButtonClasses } from "./pickersToolbarButtonClasses.js";
export interface PickersToolbarButtonProps extends ExtendMui<ButtonProps, 'value' | 'variant'> {
  align?: TypographyProps['align'];
  selected: boolean;
  typographyClassName?: string;
  value: React.ReactNode;
  variant: TypographyProps['variant'];
  classes?: Partial<PickersToolbarButtonClasses>;
  width?: number | string;
}
export declare const PickersToolbarButton: React.ForwardRefExoticComponent<Omit<PickersToolbarButtonProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
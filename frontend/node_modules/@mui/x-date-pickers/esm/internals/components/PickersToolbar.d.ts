import * as React from 'react';
import { BaseToolbarProps } from "../models/props/toolbar.js";
import { PickersToolbarClasses } from "./pickersToolbarClasses.js";
export interface PickersToolbarProps extends Pick<BaseToolbarProps, 'hidden' | 'titleId'> {
  className?: string;
  landscapeDirection?: 'row' | 'column';
  toolbarTitle: React.ReactNode;
  classes?: Partial<PickersToolbarClasses>;
}
type PickersToolbarComponent = ((props: React.PropsWithChildren<PickersToolbarProps> & React.RefAttributes<HTMLDivElement>) => React.JSX.Element) & {
  propTypes?: any;
};
export declare const PickersToolbar: PickersToolbarComponent;
export {};
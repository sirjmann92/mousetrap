import * as React from 'react';
import { StackProps } from '@mui/material/Stack';
import { SxProps, Theme } from '@mui/material/styles';
interface DemoGridProps {
  children: React.ReactNode;
  components: string[];
  sx?: SxProps<Theme>;
}
interface DemoItemProps extends Omit<StackProps, 'component'> {
  label?: React.ReactNode;
  component?: string;
}
/**
 * WARNING: This is an internal component used in documentation to achieve a desired layout.
 * Please do not use it in your application.
 */
export declare function DemoItem(props: DemoItemProps): React.JSX.Element;
export declare namespace DemoItem {
  var displayName: string;
}
/**
 * WARNING: This is an internal component used in documentation to achieve a desired layout.
 * Please do not use it in your application.
 */
export declare function DemoContainer(props: DemoGridProps): React.JSX.Element;
export {};
import * as React from 'react';
interface TailwindDemoContainerProps {
  children: React.ReactNode;
  documentBody?: HTMLElement;
}
/**
 * WARNING: This is an internal component used in documentation to inject the Tailwind script.
 * Please do not use it in your application.
 */
export declare function TailwindDemoContainer(props: TailwindDemoContainerProps): string | number | bigint | boolean | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.JSX.Element | null | undefined;
export {};
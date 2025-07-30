import * as React from 'react';
export type RenderProp<Props, State = {}> = ((props: Props, state: State) => React.ReactElement<unknown>) | React.ReactElement<Props>;
/**
 * Resolves the rendering logic for a component.
 * Handles three scenarios:
 * 1. A render function that receives props and state
 * 2. A React element
 * 3. A default element
 *
 * @ignore - internal hook.
 */
export declare function useComponentRenderer<Props extends React.HTMLAttributes<any>, State extends Record<string, any>>(defaultElement: keyof React.JSX.IntrinsicElements | React.ComponentType<Props>, render: RenderProp<Props, State> | undefined, props: Props, state?: State): React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
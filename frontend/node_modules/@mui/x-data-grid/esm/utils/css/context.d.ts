import * as React from 'react';
export declare function useCSSVariablesClass(): string;
export declare function useCSSVariablesContext(): {
  className: string;
  tag: React.JSX.Element;
};
export declare function GridPortalWrapper({
  children
}: {
  children: React.ReactNode;
}): React.JSX.Element;
export declare function GridCSSVariablesContext(props: {
  children: any;
}): React.JSX.Element;
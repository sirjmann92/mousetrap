declare const keys: {
  readonly spacingUnit: "--DataGrid-t-spacing-unit";
  readonly colors: {
    readonly border: {
      readonly base: "--DataGrid-t-color-border-base";
    };
    readonly foreground: {
      readonly base: "--DataGrid-t-color-foreground-base";
      readonly muted: "--DataGrid-t-color-foreground-muted";
      readonly accent: "--DataGrid-t-color-foreground-accent";
      readonly disabled: "--DataGrid-t-color-foreground-disabled";
      readonly error: "--DataGrid-t-color-foreground-error";
    };
    readonly background: {
      readonly base: "--DataGrid-t-color-background-base";
      readonly overlay: "--DataGrid-t-color-background-overlay";
      readonly backdrop: "--DataGrid-t-color-background-backdrop";
    };
    readonly interactive: {
      readonly hover: "--DataGrid-t-color-interactive-hover";
      readonly hoverOpacity: "--DataGrid-t-color-interactive-hover-opacity";
      readonly focus: "--DataGrid-t-color-interactive-focus";
      readonly focusOpacity: "--DataGrid-t-color-interactive-focus-opacity";
      readonly disabled: "--DataGrid-t-color-interactive-disabled";
      readonly disabledOpacity: "--DataGrid-t-color-interactive-disabled-opacity";
      readonly selected: "--DataGrid-t-color-interactive-selected";
      readonly selectedOpacity: "--DataGrid-t-color-interactive-selected-opacity";
    };
  };
  readonly header: {
    readonly background: {
      readonly base: "--DataGrid-t-header-background-base";
    };
  };
  readonly cell: {
    readonly background: {
      readonly pinned: "--DataGrid-t-cell-background-pinned";
    };
  };
  readonly radius: {
    readonly base: "--DataGrid-t-radius-base";
  };
  readonly typography: {
    readonly font: {
      readonly body: "--DataGrid-t-typography-font-body";
      readonly small: "--DataGrid-t-typography-font-small";
      readonly large: "--DataGrid-t-typography-font-large";
    };
    readonly fontFamily: {
      readonly base: "--DataGrid-t-typography-font-family-base";
    };
    readonly fontWeight: {
      readonly light: "--DataGrid-t-typography-font-weight-light";
      readonly regular: "--DataGrid-t-typography-font-weight-regular";
      readonly medium: "--DataGrid-t-typography-font-weight-medium";
      readonly bold: "--DataGrid-t-typography-font-weight-bold";
    };
  };
  readonly transitions: {
    readonly easing: {
      readonly easeIn: "--DataGrid-t-transition-easing-ease-in";
      readonly easeOut: "--DataGrid-t-transition-easing-ease-out";
      readonly easeInOut: "--DataGrid-t-transition-easing-ease-in-out";
    };
    readonly duration: {
      readonly short: "--DataGrid-t-transition-duration-short";
      readonly base: "--DataGrid-t-transition-duration-base";
      readonly long: "--DataGrid-t-transition-duration-long";
    };
  };
  readonly shadows: {
    readonly base: "--DataGrid-t-shadow-base";
    readonly overlay: "--DataGrid-t-shadow-overlay";
  };
  readonly zIndex: {
    readonly panel: "--DataGrid-t-z-index-panel";
    readonly menu: "--DataGrid-t-z-index-menu";
  };
};
export type GridCSSVariablesInterface = { [E in CreateObjectEntries<typeof keys> as E['value']]: string | number };
type Entry = {
  key: string;
  value: unknown;
};
type EmptyEntry<TValue> = {
  key: '';
  value: TValue;
};
type CreateObjectEntries<TValue, TValueInitial = TValue> = TValue extends object ? { [TKey in keyof TValue]-?: TKey extends string ? OmitItself<TValue[TKey], TValueInitial> extends infer TNestedValue ? TNestedValue extends Entry ? {
  key: `${TKey}.${TNestedValue['key']}`;
  value: TNestedValue['value'];
} : never : never : never }[keyof TValue] : EmptyEntry<TValue>;
type OmitItself<TValue, TValueInitial> = TValue extends TValueInitial ? EmptyEntry<TValue> : CreateObjectEntries<TValue, TValueInitial>;
export declare const vars: {
  spacingUnit: "--DataGrid-t-spacing-unit";
  colors: {
    readonly border: {
      readonly base: "--DataGrid-t-color-border-base";
    };
    readonly foreground: {
      readonly base: "--DataGrid-t-color-foreground-base";
      readonly muted: "--DataGrid-t-color-foreground-muted";
      readonly accent: "--DataGrid-t-color-foreground-accent";
      readonly disabled: "--DataGrid-t-color-foreground-disabled";
      readonly error: "--DataGrid-t-color-foreground-error";
    };
    readonly background: {
      readonly base: "--DataGrid-t-color-background-base";
      readonly overlay: "--DataGrid-t-color-background-overlay";
      readonly backdrop: "--DataGrid-t-color-background-backdrop";
    };
    readonly interactive: {
      readonly hover: "--DataGrid-t-color-interactive-hover";
      readonly hoverOpacity: "--DataGrid-t-color-interactive-hover-opacity";
      readonly focus: "--DataGrid-t-color-interactive-focus";
      readonly focusOpacity: "--DataGrid-t-color-interactive-focus-opacity";
      readonly disabled: "--DataGrid-t-color-interactive-disabled";
      readonly disabledOpacity: "--DataGrid-t-color-interactive-disabled-opacity";
      readonly selected: "--DataGrid-t-color-interactive-selected";
      readonly selectedOpacity: "--DataGrid-t-color-interactive-selected-opacity";
    };
  };
  header: {
    readonly background: {
      readonly base: "--DataGrid-t-header-background-base";
    };
  };
  cell: {
    readonly background: {
      readonly pinned: "--DataGrid-t-cell-background-pinned";
    };
  };
  radius: {
    readonly base: "--DataGrid-t-radius-base";
  };
  typography: {
    readonly font: {
      readonly body: "--DataGrid-t-typography-font-body";
      readonly small: "--DataGrid-t-typography-font-small";
      readonly large: "--DataGrid-t-typography-font-large";
    };
    readonly fontFamily: {
      readonly base: "--DataGrid-t-typography-font-family-base";
    };
    readonly fontWeight: {
      readonly light: "--DataGrid-t-typography-font-weight-light";
      readonly regular: "--DataGrid-t-typography-font-weight-regular";
      readonly medium: "--DataGrid-t-typography-font-weight-medium";
      readonly bold: "--DataGrid-t-typography-font-weight-bold";
    };
  };
  transitions: {
    readonly easing: {
      readonly easeIn: "--DataGrid-t-transition-easing-ease-in";
      readonly easeOut: "--DataGrid-t-transition-easing-ease-out";
      readonly easeInOut: "--DataGrid-t-transition-easing-ease-in-out";
    };
    readonly duration: {
      readonly short: "--DataGrid-t-transition-duration-short";
      readonly base: "--DataGrid-t-transition-duration-base";
      readonly long: "--DataGrid-t-transition-duration-long";
    };
  };
  shadows: {
    readonly base: "--DataGrid-t-shadow-base";
    readonly overlay: "--DataGrid-t-shadow-overlay";
  };
  zIndex: {
    readonly panel: "--DataGrid-t-z-index-panel";
    readonly menu: "--DataGrid-t-z-index-menu";
  };
  breakpoints: {
    values: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    up: (key: any) => string;
  };
  spacing: typeof spacing;
  transition: typeof transition;
  keys: {
    readonly spacingUnit: "--DataGrid-t-spacing-unit";
    readonly colors: {
      readonly border: {
        readonly base: "--DataGrid-t-color-border-base";
      };
      readonly foreground: {
        readonly base: "--DataGrid-t-color-foreground-base";
        readonly muted: "--DataGrid-t-color-foreground-muted";
        readonly accent: "--DataGrid-t-color-foreground-accent";
        readonly disabled: "--DataGrid-t-color-foreground-disabled";
        readonly error: "--DataGrid-t-color-foreground-error";
      };
      readonly background: {
        readonly base: "--DataGrid-t-color-background-base";
        readonly overlay: "--DataGrid-t-color-background-overlay";
        readonly backdrop: "--DataGrid-t-color-background-backdrop";
      };
      readonly interactive: {
        readonly hover: "--DataGrid-t-color-interactive-hover";
        readonly hoverOpacity: "--DataGrid-t-color-interactive-hover-opacity";
        readonly focus: "--DataGrid-t-color-interactive-focus";
        readonly focusOpacity: "--DataGrid-t-color-interactive-focus-opacity";
        readonly disabled: "--DataGrid-t-color-interactive-disabled";
        readonly disabledOpacity: "--DataGrid-t-color-interactive-disabled-opacity";
        readonly selected: "--DataGrid-t-color-interactive-selected";
        readonly selectedOpacity: "--DataGrid-t-color-interactive-selected-opacity";
      };
    };
    readonly header: {
      readonly background: {
        readonly base: "--DataGrid-t-header-background-base";
      };
    };
    readonly cell: {
      readonly background: {
        readonly pinned: "--DataGrid-t-cell-background-pinned";
      };
    };
    readonly radius: {
      readonly base: "--DataGrid-t-radius-base";
    };
    readonly typography: {
      readonly font: {
        readonly body: "--DataGrid-t-typography-font-body";
        readonly small: "--DataGrid-t-typography-font-small";
        readonly large: "--DataGrid-t-typography-font-large";
      };
      readonly fontFamily: {
        readonly base: "--DataGrid-t-typography-font-family-base";
      };
      readonly fontWeight: {
        readonly light: "--DataGrid-t-typography-font-weight-light";
        readonly regular: "--DataGrid-t-typography-font-weight-regular";
        readonly medium: "--DataGrid-t-typography-font-weight-medium";
        readonly bold: "--DataGrid-t-typography-font-weight-bold";
      };
    };
    readonly transitions: {
      readonly easing: {
        readonly easeIn: "--DataGrid-t-transition-easing-ease-in";
        readonly easeOut: "--DataGrid-t-transition-easing-ease-out";
        readonly easeInOut: "--DataGrid-t-transition-easing-ease-in-out";
      };
      readonly duration: {
        readonly short: "--DataGrid-t-transition-duration-short";
        readonly base: "--DataGrid-t-transition-duration-base";
        readonly long: "--DataGrid-t-transition-duration-long";
      };
    };
    readonly shadows: {
      readonly base: "--DataGrid-t-shadow-base";
      readonly overlay: "--DataGrid-t-shadow-overlay";
    };
    readonly zIndex: {
      readonly panel: "--DataGrid-t-z-index-panel";
      readonly menu: "--DataGrid-t-z-index-menu";
    };
  };
};
declare function spacing(a?: number, b?: number, c?: number, d?: number): string;
declare function transition(props: string[], options?: {
  duration?: string;
  easing?: string;
  delay?: number;
}): string;
export {};
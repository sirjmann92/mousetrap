import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { GridFilterItem } from "./gridFilterItem.js";
import type { GridApiCommon } from "./api/gridApiCommon.js";
import type { GridApiCommunity } from "./api/gridApiCommunity.js";
export type GridFilterInputSlotProps = {
  size?: 'small' | 'medium';
  label?: React.ReactNode;
  placeholder?: string;
};
export type GridFilterInputValueProps<T extends GridFilterInputSlotProps = GridFilterInputSlotProps, Api extends GridApiCommon = GridApiCommunity> = {
  item: GridFilterItem;
  applyValue: (value: GridFilterItem) => void;
  apiRef: RefObject<Api>;
  inputRef?: React.Ref<HTMLElement | null>;
  focusElementRef?: React.Ref<any>;
  headerFilterMenu?: React.ReactNode;
  clearButton?: React.ReactNode | null;
  /**
   * It is `true` if the filter either has a value or an operator with no value
   * required is selected (for example `isEmpty`)
   */
  isFilterActive?: boolean;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
  tabIndex?: number;
  disabled?: boolean;
  className?: string;
  slotProps?: {
    root: T;
  };
};
import * as React from 'react';
import { TextFieldProps } from '@mui/material/TextField';
import { IconButtonProps } from '@mui/material/IconButton';
import { InputAdornmentProps } from '@mui/material/InputAdornment';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { MakeOptional, SlotComponentPropsFromProps } from '@mui/x-internals/types';
import { FieldOwnerState } from "../../models/index.js";
import { UseFieldOwnerStateParameters } from "../hooks/useFieldOwnerState.js";
import type { UseFieldReturnValue, UseFieldProps } from "../hooks/useField/index.js";
import { PickersTextFieldProps } from "../../PickersTextField/index.js";
export declare const cleanFieldResponse: <TFieldResponse extends MakeOptional<UseFieldReturnValue<any, ExportedPickerFieldUIProps & {
  [key: string]: any;
}>, "onClear" | "clearable">>({
  enableAccessibleFieldDOMStructure,
  ...fieldResponse
}: TFieldResponse) => ExportedPickerFieldUIProps & {
  openPickerAriaLabel: string;
  textFieldProps: TextFieldProps | PickersTextFieldProps;
};
export declare const PickerFieldUIContext: React.Context<PickerFieldUIContextValue>;
/**
 * Adds the button to open the Picker and the button to clear the value of the field.
 * @ignore - internal component.
 */
export declare function PickerFieldUI<TEnableAccessibleFieldDOMStructure extends boolean, TProps extends UseFieldProps<TEnableAccessibleFieldDOMStructure>>(props: PickerFieldUIProps<TEnableAccessibleFieldDOMStructure, TProps>): React.JSX.Element;
export interface ExportedPickerFieldUIProps {
  /**
   * If `true`, a clear button will be shown in the field allowing value clearing.
   * @default false
   */
  clearable?: boolean;
  /**
   * Callback fired when the clear button is clicked.
   */
  onClear?: React.MouseEventHandler;
  /**
   * The position at which the clear button is placed.
   * If the field is not clearable, the button is not rendered.
   * @default 'end'
   */
  clearButtonPosition?: 'start' | 'end';
  /**
   * The position at which the opening button is placed.
   * If there is no Picker to open, the button is not rendered
   * @default 'end'
   */
  openPickerButtonPosition?: 'start' | 'end';
}
export interface PickerFieldUIProps<TEnableAccessibleFieldDOMStructure extends boolean, TProps extends UseFieldProps<TEnableAccessibleFieldDOMStructure>> {
  /**
   * Overridable component slots.
   * @default {}
   */
  slots?: PickerFieldUISlots;
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps?: PickerFieldUISlotProps;
  /**
   * Object returned by the `useField` hook or one of its wrapper (for example `useDateField`).
   */
  fieldResponse: UseFieldReturnValue<TEnableAccessibleFieldDOMStructure, TProps>;
  /**
   * The component to use to render the Picker opening icon if none is provided in the Picker's slots.
   */
  defaultOpenPickerIcon: React.ElementType;
}
export interface PickerFieldUISlots {
  /**
   * Form control with an input to render the value.
   * @default <PickersTextField />, or <TextField /> from '@mui/material' if `enableAccessibleFieldDOMStructure` is `false`.
   */
  textField?: React.ElementType;
  /**
   * Component displayed on the start or end input adornment used to open the Picker.
   * @default InputAdornment
   */
  inputAdornment?: React.ElementType<InputAdornmentProps>;
  /**
   * Button to clear the value.
   * @default IconButton
   */
  clearButton?: React.ElementType;
  /**
   * Icon to display in the button used to clean the value.
   * @default ClearIcon
   */
  clearIcon?: React.ElementType;
}
export interface PickerFieldUISlotsFromContext extends PickerFieldUISlots {
  /**
   * Button to open the Picker.
   * @default IconButton
   */
  openPickerButton?: React.ElementType<IconButtonProps>;
  /**
   * Icon to display in the button used to open the Picker.
   */
  openPickerIcon?: React.ElementType;
}
export interface PickerFieldUISlotProps {
  textField?: SlotComponentPropsFromProps<Omit<TextFieldProps, 'onKeyDown'> | PickersTextFieldProps, {}, FieldOwnerState>;
  inputAdornment?: SlotComponentPropsFromProps<InputAdornmentProps, {}, FieldInputAdornmentOwnerState>;
  clearIcon?: SlotComponentPropsFromProps<SvgIconProps, {}, FieldOwnerState>;
  clearButton?: SlotComponentPropsFromProps<IconButtonProps, {}, FieldOwnerState>;
}
export interface PickerFieldUISlotPropsFromContext extends PickerFieldUISlotProps {
  openPickerButton?: SlotComponentPropsFromProps<IconButtonProps, {}, FieldOwnerState>;
  openPickerIcon?: SlotComponentPropsFromProps<SvgIconProps, {}, FieldOwnerState>;
}
interface FieldInputAdornmentOwnerState extends FieldOwnerState {
  position: 'start' | 'end';
}
interface PickerFieldUIContextValue {
  inputRef: React.Ref<HTMLInputElement> | undefined;
  slots: PickerFieldUISlotsFromContext;
  slotProps: PickerFieldUISlotPropsFromContext;
}
export declare function mergeSlotProps<TProps extends {}, TOwnerState extends FieldOwnerState>(slotPropsA: SlotComponentPropsFromProps<TProps, {}, TOwnerState> | undefined, slotPropsB: SlotComponentPropsFromProps<TProps, {}, TOwnerState> | undefined): Partial<TProps> | ((ownerState: TOwnerState) => {}) | undefined;
/**
 * The `textField` slot props cannot be handled inside `PickerFieldUI` because it would be a breaking change to not pass the enriched props to `useField`.
 * Once the non-accessible DOM structure will be removed, we will be able to remove the `textField` slot and clean this logic.
 */
export declare function useFieldTextFieldProps<TProps extends UseFieldOwnerStateParameters & {
  inputProps?: {};
  InputProps?: {};
}>(parameters: UseFieldTextFieldPropsParameters): TProps;
interface UseFieldTextFieldPropsParameters {
  slotProps: {
    textField?: SlotComponentPropsFromProps<Omit<TextFieldProps, 'onKeyDown'> | PickersTextFieldProps, {}, FieldOwnerState>;
  } | undefined;
  ref: React.Ref<HTMLDivElement>;
  externalForwardedProps: any;
}
export declare function PickerFieldUIContextProvider(props: PickerFieldUIContextProviderProps): React.JSX.Element;
interface PickerFieldUIContextProviderProps {
  children: React.ReactNode;
  inputRef: React.Ref<HTMLInputElement> | undefined;
  slots: PickerFieldUISlotsFromContext | undefined;
  slotProps: PickerFieldUISlotPropsFromContext | undefined;
}
export {};
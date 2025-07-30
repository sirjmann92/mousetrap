"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickersTextField = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _styles = require("@mui/material/styles");
var _refType = _interopRequireDefault(require("@mui/utils/refType"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _useId = _interopRequireDefault(require("@mui/utils/useId"));
var _InputLabel = _interopRequireDefault(require("@mui/material/InputLabel"));
var _FormHelperText = _interopRequireDefault(require("@mui/material/FormHelperText"));
var _FormControl = _interopRequireDefault(require("@mui/material/FormControl"));
var _pickersTextFieldClasses = require("./pickersTextFieldClasses");
var _PickersOutlinedInput = require("./PickersOutlinedInput");
var _PickersFilledInput = require("./PickersFilledInput");
var _PickersInput = require("./PickersInput");
var _useFieldOwnerState = require("../internals/hooks/useFieldOwnerState");
var _usePickerTextFieldOwnerState = require("./usePickerTextFieldOwnerState");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["onFocus", "onBlur", "className", "classes", "color", "disabled", "error", "variant", "required", "hiddenLabel", "InputProps", "inputProps", "inputRef", "sectionListRef", "elements", "areAllSectionsEmpty", "onClick", "onKeyDown", "onKeyUp", "onPaste", "onInput", "endAdornment", "startAdornment", "tabIndex", "contentEditable", "focused", "value", "onChange", "fullWidth", "id", "name", "helperText", "FormHelperTextProps", "label", "InputLabelProps", "data-active-range-position"];
const VARIANT_COMPONENT = {
  standard: _PickersInput.PickersInput,
  filled: _PickersFilledInput.PickersFilledInput,
  outlined: _PickersOutlinedInput.PickersOutlinedInput
};
const PickersTextFieldRoot = (0, _styles.styled)(_FormControl.default, {
  name: 'MuiPickersTextField',
  slot: 'Root'
})({
  maxWidth: '100%'
});
const useUtilityClasses = (classes, ownerState) => {
  const {
    isFieldFocused,
    isFieldDisabled,
    isFieldRequired
  } = ownerState;
  const slots = {
    root: ['root', isFieldFocused && !isFieldDisabled && 'focused', isFieldDisabled && 'disabled', isFieldRequired && 'required']
  };
  return (0, _composeClasses.default)(slots, _pickersTextFieldClasses.getPickersTextFieldUtilityClass, classes);
};
const PickersTextField = exports.PickersTextField = /*#__PURE__*/React.forwardRef(function PickersTextField(inProps, ref) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiPickersTextField'
  });
  const {
      // Props used by FormControl
      onFocus,
      onBlur,
      className,
      classes: classesProp,
      color = 'primary',
      disabled = false,
      error = false,
      variant = 'outlined',
      required = false,
      hiddenLabel = false,
      // Props used by PickersInput
      InputProps,
      inputProps,
      inputRef,
      sectionListRef,
      elements,
      areAllSectionsEmpty,
      onClick,
      onKeyDown,
      onKeyUp,
      onPaste,
      onInput,
      endAdornment,
      startAdornment,
      tabIndex,
      contentEditable,
      focused,
      value,
      onChange,
      fullWidth,
      id: idProp,
      name,
      // Props used by FormHelperText
      helperText,
      FormHelperTextProps,
      // Props used by InputLabel
      label,
      InputLabelProps,
      // @ts-ignore
      'data-active-range-position': dataActiveRangePosition
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const rootRef = React.useRef(null);
  const handleRootRef = (0, _useForkRef.default)(ref, rootRef);
  const id = (0, _useId.default)(idProp);
  const helperTextId = helperText && id ? `${id}-helper-text` : undefined;
  const inputLabelId = label && id ? `${id}-label` : undefined;
  const fieldOwnerState = (0, _useFieldOwnerState.useFieldOwnerState)({
    disabled: props.disabled,
    required: props.required,
    readOnly: InputProps?.readOnly
  });
  const ownerState = React.useMemo(() => (0, _extends2.default)({}, fieldOwnerState, {
    isFieldValueEmpty: areAllSectionsEmpty,
    isFieldFocused: focused ?? false,
    hasFieldError: error ?? false,
    inputSize: props.size ?? 'medium',
    inputColor: color ?? 'primary',
    isInputInFullWidth: fullWidth ?? false,
    hasStartAdornment: Boolean(startAdornment ?? InputProps?.startAdornment),
    hasEndAdornment: Boolean(endAdornment ?? InputProps?.endAdornment),
    inputHasLabel: !!label
  }), [fieldOwnerState, areAllSectionsEmpty, focused, error, props.size, color, fullWidth, startAdornment, endAdornment, InputProps?.startAdornment, InputProps?.endAdornment, label]);
  const classes = useUtilityClasses(classesProp, ownerState);
  const PickersInputComponent = VARIANT_COMPONENT[variant];
  const inputAdditionalProps = {};
  if (variant === 'outlined') {
    if (InputLabelProps && typeof InputLabelProps.shrink !== 'undefined') {
      inputAdditionalProps.notched = InputLabelProps.shrink;
    }
    inputAdditionalProps.label = label;
  } else if (variant === 'filled') {
    inputAdditionalProps.hiddenLabel = hiddenLabel;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_usePickerTextFieldOwnerState.PickerTextFieldOwnerStateContext.Provider, {
    value: ownerState,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(PickersTextFieldRoot, (0, _extends2.default)({
      className: (0, _clsx.default)(classes.root, className),
      ref: handleRootRef,
      focused: focused,
      disabled: disabled,
      variant: variant,
      error: error,
      color: color,
      fullWidth: fullWidth,
      required: required,
      ownerState: ownerState
    }, other, {
      children: [label != null && label !== '' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_InputLabel.default, (0, _extends2.default)({
        htmlFor: id,
        id: inputLabelId
      }, InputLabelProps, {
        children: label
      })), /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersInputComponent, (0, _extends2.default)({
        elements: elements,
        areAllSectionsEmpty: areAllSectionsEmpty,
        onClick: onClick,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
        onInput: onInput,
        onPaste: onPaste,
        onFocus: onFocus,
        onBlur: onBlur,
        endAdornment: endAdornment,
        startAdornment: startAdornment,
        tabIndex: tabIndex,
        contentEditable: contentEditable,
        value: value,
        onChange: onChange,
        id: id,
        fullWidth: fullWidth,
        inputProps: inputProps,
        inputRef: inputRef,
        sectionListRef: sectionListRef,
        label: label,
        name: name,
        role: "group",
        "aria-labelledby": inputLabelId,
        "aria-describedby": helperTextId,
        "aria-live": helperTextId ? 'polite' : undefined,
        "data-active-range-position": dataActiveRangePosition
      }, inputAdditionalProps, InputProps)), helperText && /*#__PURE__*/(0, _jsxRuntime.jsx)(_FormHelperText.default, (0, _extends2.default)({
        id: helperTextId
      }, FormHelperTextProps, {
        children: helperText
      }))]
    }))
  });
});
if (process.env.NODE_ENV !== "production") PickersTextField.displayName = "PickersTextField";
process.env.NODE_ENV !== "production" ? PickersTextField.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Is `true` if the current values equals the empty value.
   * For a single item value, it means that `value === null`
   * For a range value, it means that `value === [null, null]`
   */
  areAllSectionsEmpty: _propTypes.default.bool.isRequired,
  className: _propTypes.default.string,
  /**
   * The color of the component.
   * It supports both default and custom theme colors, which can be added as shown in the
   * [palette customization guide](https://mui.com/material-ui/customization/palette/#custom-colors).
   * @default 'primary'
   */
  color: _propTypes.default.oneOf(['error', 'info', 'primary', 'secondary', 'success', 'warning']),
  component: _propTypes.default.elementType,
  /**
   * If true, the whole element is editable.
   * Useful when all the sections are selected.
   */
  contentEditable: _propTypes.default.bool.isRequired,
  disabled: _propTypes.default.bool.isRequired,
  /**
   * The elements to render.
   * Each element contains the prop to edit a section of the value.
   */
  elements: _propTypes.default.arrayOf(_propTypes.default.shape({
    after: _propTypes.default.object.isRequired,
    before: _propTypes.default.object.isRequired,
    container: _propTypes.default.object.isRequired,
    content: _propTypes.default.object.isRequired
  })).isRequired,
  endAdornment: _propTypes.default.node,
  error: _propTypes.default.bool.isRequired,
  /**
   * If `true`, the component is displayed in focused state.
   */
  focused: _propTypes.default.bool,
  FormHelperTextProps: _propTypes.default.object,
  fullWidth: _propTypes.default.bool,
  /**
   * The helper text content.
   */
  helperText: _propTypes.default.node,
  /**
   * If `true`, the label is hidden.
   * This is used to increase density for a `FilledInput`.
   * Be sure to add `aria-label` to the `input` element.
   * @default false
   */
  hiddenLabel: _propTypes.default.bool,
  id: _propTypes.default.string,
  InputLabelProps: _propTypes.default.object,
  inputProps: _propTypes.default.object,
  /**
   * Props applied to the Input element.
   * It will be a [`FilledInput`](/material-ui/api/filled-input/),
   * [`OutlinedInput`](/material-ui/api/outlined-input/) or [`Input`](/material-ui/api/input/)
   * component depending on the `variant` prop value.
   */
  InputProps: _propTypes.default.object,
  inputRef: _refType.default,
  label: _propTypes.default.node,
  /**
   * If `dense` or `normal`, will adjust vertical spacing of this and contained components.
   * @default 'none'
   */
  margin: _propTypes.default.oneOf(['dense', 'none', 'normal']),
  name: _propTypes.default.string,
  onBlur: _propTypes.default.func.isRequired,
  onChange: _propTypes.default.func.isRequired,
  onClick: _propTypes.default.func.isRequired,
  onFocus: _propTypes.default.func.isRequired,
  onInput: _propTypes.default.func.isRequired,
  onKeyDown: _propTypes.default.func.isRequired,
  onPaste: _propTypes.default.func.isRequired,
  readOnly: _propTypes.default.bool,
  /**
   * If `true`, the label will indicate that the `input` is required.
   * @default false
   */
  required: _propTypes.default.bool,
  sectionListRef: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.shape({
    current: _propTypes.default.shape({
      getRoot: _propTypes.default.func.isRequired,
      getSectionContainer: _propTypes.default.func.isRequired,
      getSectionContent: _propTypes.default.func.isRequired,
      getSectionIndexFromDOMElement: _propTypes.default.func.isRequired
    })
  })]),
  /**
   * The size of the component.
   * @default 'medium'
   */
  size: _propTypes.default.oneOf(['medium', 'small']),
  startAdornment: _propTypes.default.node,
  style: _propTypes.default.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object]),
  value: _propTypes.default.string.isRequired,
  /**
   * The variant to use.
   * @default 'outlined'
   */
  variant: _propTypes.default.oneOf(['filled', 'outlined', 'standard'])
} : void 0;
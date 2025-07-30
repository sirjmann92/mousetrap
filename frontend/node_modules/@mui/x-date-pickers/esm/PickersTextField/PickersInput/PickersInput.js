import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
const _excluded = ["label", "autoFocus", "disableUnderline", "ownerState", "classes"];
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled, useThemeProps } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import refType from '@mui/utils/refType';
import composeClasses from '@mui/utils/composeClasses';
import { pickersInputClasses, getPickersInputUtilityClass } from "./pickersInputClasses.js";
import { PickersInputBase } from "../PickersInputBase/index.js";
import { PickersInputBaseRoot } from "../PickersInputBase/PickersInputBase.js";
import { usePickerTextFieldOwnerState } from "../usePickerTextFieldOwnerState.js";
import { jsx as _jsx } from "react/jsx-runtime";
const PickersInputRoot = styled(PickersInputBaseRoot, {
  name: 'MuiPickersInput',
  slot: 'Root',
  shouldForwardProp: prop => shouldForwardProp(prop) && prop !== 'disableUnderline'
})(({
  theme
}) => {
  const light = theme.palette.mode === 'light';
  let bottomLineColor = light ? 'rgba(0, 0, 0, 0.42)' : 'rgba(255, 255, 255, 0.7)';
  if (theme.vars) {
    bottomLineColor = `rgba(${theme.vars.palette.common.onBackgroundChannel} / ${theme.vars.opacity.inputUnderline})`;
  }
  return {
    'label + &': {
      marginTop: 16
    },
    variants: [...Object.keys((theme.vars ?? theme).palette)
    // @ts-ignore
    .filter(key => (theme.vars ?? theme).palette[key].main).map(color => ({
      props: {
        inputColor: color,
        inputHasUnderline: true
      },
      style: {
        '&::after': {
          // @ts-ignore
          borderBottom: `2px solid ${(theme.vars || theme).palette[color].main}`
        }
      }
    })), {
      props: {
        inputHasUnderline: true
      },
      style: {
        '&::after': {
          background: 'red',
          left: 0,
          bottom: 0,
          // Doing the other way around crash on IE11 "''" https://github.com/cssinjs/jss/issues/242
          content: '""',
          position: 'absolute',
          right: 0,
          transform: 'scaleX(0)',
          transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.easeOut
          }),
          pointerEvents: 'none' // Transparent to the hover style.
        },
        [`&.${pickersInputClasses.focused}:after`]: {
          // translateX(0) is a workaround for Safari transform scale bug
          // See https://github.com/mui/material-ui/issues/31766
          transform: 'scaleX(1) translateX(0)'
        },
        [`&.${pickersInputClasses.error}`]: {
          '&:before, &:after': {
            borderBottomColor: (theme.vars || theme).palette.error.main
          }
        },
        '&::before': {
          borderBottom: `1px solid ${bottomLineColor}`,
          left: 0,
          bottom: 0,
          // Doing the other way around crash on IE11 "''" https://github.com/cssinjs/jss/issues/242
          content: '"\\00a0"',
          position: 'absolute',
          right: 0,
          transition: theme.transitions.create('border-bottom-color', {
            duration: theme.transitions.duration.shorter
          }),
          pointerEvents: 'none' // Transparent to the hover style.
        },
        [`&:hover:not(.${pickersInputClasses.disabled}, .${pickersInputClasses.error}):before`]: {
          borderBottom: `2px solid ${(theme.vars || theme).palette.text.primary}`,
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            borderBottom: `1px solid ${bottomLineColor}`
          }
        },
        [`&.${pickersInputClasses.disabled}:before`]: {
          borderBottomStyle: 'dotted'
        }
      }
    }]
  };
});
const useUtilityClasses = (classes, ownerState) => {
  const {
    inputHasUnderline
  } = ownerState;
  const slots = {
    root: ['root', !inputHasUnderline && 'underline'],
    input: ['input']
  };
  const composedClasses = composeClasses(slots, getPickersInputUtilityClass, classes);
  return _extends({}, classes, composedClasses);
};

/**
 * @ignore - internal component.
 */
const PickersInput = /*#__PURE__*/React.forwardRef(function PickersInput(inProps, ref) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiPickersInput'
  });
  const {
      label,
      disableUnderline = false,
      classes: classesProp
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const pickerTextFieldOwnerState = usePickerTextFieldOwnerState();
  const ownerState = _extends({}, pickerTextFieldOwnerState, {
    inputHasUnderline: !disableUnderline
  });
  const classes = useUtilityClasses(classesProp, ownerState);
  return /*#__PURE__*/_jsx(PickersInputBase, _extends({
    slots: {
      root: PickersInputRoot
    },
    slotProps: {
      root: {
        disableUnderline
      }
    }
  }, other, {
    ownerState: ownerState,
    label: label,
    classes: classes,
    ref: ref
  }));
});
if (process.env.NODE_ENV !== "production") PickersInput.displayName = "PickersInput";
process.env.NODE_ENV !== "production" ? PickersInput.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Is `true` if the current values equals the empty value.
   * For a single item value, it means that `value === null`
   * For a range value, it means that `value === [null, null]`
   */
  areAllSectionsEmpty: PropTypes.bool.isRequired,
  className: PropTypes.string,
  component: PropTypes.elementType,
  /**
   * If true, the whole element is editable.
   * Useful when all the sections are selected.
   */
  contentEditable: PropTypes.bool.isRequired,
  'data-multi-input': PropTypes.string,
  disableUnderline: PropTypes.bool,
  /**
   * The elements to render.
   * Each element contains the prop to edit a section of the value.
   */
  elements: PropTypes.arrayOf(PropTypes.shape({
    after: PropTypes.object.isRequired,
    before: PropTypes.object.isRequired,
    container: PropTypes.object.isRequired,
    content: PropTypes.object.isRequired
  })).isRequired,
  endAdornment: PropTypes.node,
  fullWidth: PropTypes.bool,
  id: PropTypes.string,
  inputProps: PropTypes.object,
  inputRef: refType,
  label: PropTypes.node,
  margin: PropTypes.oneOf(['dense', 'none', 'normal']),
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onInput: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onPaste: PropTypes.func.isRequired,
  ownerState: PropTypes /* @typescript-to-proptypes-ignore */.any,
  readOnly: PropTypes.bool,
  renderSuffix: PropTypes.func,
  sectionListRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({
    current: PropTypes.shape({
      getRoot: PropTypes.func.isRequired,
      getSectionContainer: PropTypes.func.isRequired,
      getSectionContent: PropTypes.func.isRequired,
      getSectionIndexFromDOMElement: PropTypes.func.isRequired
    })
  })]),
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * The components used for each slot inside.
   *
   * @default {}
   */
  slots: PropTypes.object,
  startAdornment: PropTypes.node,
  style: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object]),
  value: PropTypes.string.isRequired
} : void 0;
export { PickersInput };
PickersInput.muiName = 'Input';
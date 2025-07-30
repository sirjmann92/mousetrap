'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["actions"];
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { usePickerTranslations } from "../hooks/usePickerTranslations.js";
import { usePickerContext } from "../hooks/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
const PickersActionBarRoot = styled(DialogActions, {
  name: 'MuiPickersLayout',
  slot: 'ActionBar'
})({});

/**
 * Demos:
 *
 * - [Custom slots and subcomponents](https://mui.com/x/react-date-pickers/custom-components/)
 * - [Custom layout](https://mui.com/x/react-date-pickers/custom-layout/)
 *
 * API:
 *
 * - [PickersActionBar API](https://mui.com/x/api/date-pickers/pickers-action-bar/)
 */
function PickersActionBarComponent(props) {
  const {
      actions
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const translations = usePickerTranslations();
  const {
    clearValue,
    setValueToToday,
    acceptValueChanges,
    cancelValueChanges,
    goToNextStep,
    hasNextStep
  } = usePickerContext();
  if (actions == null || actions.length === 0) {
    return null;
  }
  const buttons = actions?.map(actionType => {
    switch (actionType) {
      case 'clear':
        return /*#__PURE__*/_jsx(Button, {
          onClick: clearValue,
          children: translations.clearButtonLabel
        }, actionType);
      case 'cancel':
        return /*#__PURE__*/_jsx(Button, {
          onClick: cancelValueChanges,
          children: translations.cancelButtonLabel
        }, actionType);
      case 'accept':
        return /*#__PURE__*/_jsx(Button, {
          onClick: acceptValueChanges,
          children: translations.okButtonLabel
        }, actionType);
      case 'today':
        return /*#__PURE__*/_jsx(Button, {
          onClick: setValueToToday,
          children: translations.todayButtonLabel
        }, actionType);
      case 'next':
        return /*#__PURE__*/_jsx(Button, {
          onClick: goToNextStep,
          children: translations.nextStepButtonLabel
        }, actionType);
      case 'nextOrAccept':
        if (hasNextStep) {
          return /*#__PURE__*/_jsx(Button, {
            onClick: goToNextStep,
            children: translations.nextStepButtonLabel
          }, actionType);
        }
        return /*#__PURE__*/_jsx(Button, {
          onClick: acceptValueChanges,
          children: translations.okButtonLabel
        }, actionType);
      default:
        return null;
    }
  });
  return /*#__PURE__*/_jsx(PickersActionBarRoot, _extends({}, other, {
    children: buttons
  }));
}
process.env.NODE_ENV !== "production" ? PickersActionBarComponent.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Ordered array of actions to display.
   * If empty, does not display that action bar.
   * @default
   * - `[]` for Pickers with one selection step which `closeOnSelect`.
   * - `['cancel', 'nextOrAccept']` for all other Pickers.
   */
  actions: PropTypes.arrayOf(PropTypes.oneOf(['accept', 'cancel', 'clear', 'next', 'nextOrAccept', 'today']).isRequired),
  /**
   * If `true`, the actions do not have additional margin.
   * @default false
   */
  disableSpacing: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
const PickersActionBar = /*#__PURE__*/React.memo(PickersActionBarComponent);
if (process.env.NODE_ENV !== "production") PickersActionBar.displayName = "PickersActionBar";
export { PickersActionBar };
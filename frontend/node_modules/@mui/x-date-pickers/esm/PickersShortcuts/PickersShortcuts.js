'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["items", "changeImportance"],
  _excluded2 = ["getValue"];
import * as React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import { VIEW_HEIGHT } from "../internals/constants/dimensions.js";
import { useIsValidValue, usePickerActionsContext } from "../hooks/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
const PickersShortcutsRoot = styled(List, {
  name: 'MuiPickersLayout',
  slot: 'Shortcuts'
})({});

/**
 * Demos:
 *
 * - [Shortcuts](https://mui.com/x/react-date-pickers/shortcuts/)
 *
 * API:
 *
 * - [PickersShortcuts API](https://mui.com/x/api/date-pickers/pickers-shortcuts/)
 */
function PickersShortcuts(props) {
  const {
      items,
      changeImportance = 'accept'
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const {
    setValue
  } = usePickerActionsContext();
  const isValidValue = useIsValidValue();
  if (items == null || items.length === 0) {
    return null;
  }
  const resolvedItems = items.map(_ref => {
    let {
        getValue
      } = _ref,
      item = _objectWithoutPropertiesLoose(_ref, _excluded2);
    const newValue = getValue({
      isValid: isValidValue
    });
    return _extends({}, item, {
      label: item.label,
      onClick: () => {
        setValue(newValue, {
          changeImportance,
          shortcut: item
        });
      },
      disabled: !isValidValue(newValue)
    });
  });
  return /*#__PURE__*/_jsx(PickersShortcutsRoot, _extends({
    dense: true,
    sx: [{
      maxHeight: VIEW_HEIGHT,
      maxWidth: 200,
      overflow: 'auto'
    }, ...(Array.isArray(other.sx) ? other.sx : [other.sx])]
  }, other, {
    children: resolvedItems.map(item => {
      return /*#__PURE__*/_jsx(ListItem, {
        children: /*#__PURE__*/_jsx(Chip, _extends({}, item))
      }, item.id ?? item.label);
    })
  }));
}
process.env.NODE_ENV !== "production" ? PickersShortcuts.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * Importance of the change when picking a shortcut:
   * - "accept": fires `onChange`, fires `onAccept` and closes the Picker.
   * - "set": fires `onChange` but do not fire `onAccept` and does not close the Picker.
   * @default "accept"
   */
  changeImportance: PropTypes.oneOf(['accept', 'set']),
  className: PropTypes.string,
  component: PropTypes.elementType,
  /**
   * If `true`, compact vertical padding designed for keyboard and mouse input is used for
   * the list and list items.
   * The prop is available to descendant components as the `dense` context.
   * @default false
   */
  dense: PropTypes.bool,
  /**
   * If `true`, vertical padding is removed from the list.
   * @default false
   */
  disablePadding: PropTypes.bool,
  /**
   * Ordered array of shortcuts to display.
   * If empty, does not display the shortcuts.
   * @default []
   */
  items: PropTypes.arrayOf(PropTypes.shape({
    getValue: PropTypes.func.isRequired,
    id: PropTypes.string,
    label: PropTypes.string.isRequired
  })),
  style: PropTypes.object,
  /**
   * The content of the subheader, normally `ListSubheader`.
   */
  subheader: PropTypes.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { PickersShortcuts };
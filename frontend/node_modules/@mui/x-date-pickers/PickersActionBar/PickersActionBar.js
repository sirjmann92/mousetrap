"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickersActionBar = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _styles = require("@mui/material/styles");
var _Button = _interopRequireDefault(require("@mui/material/Button"));
var _DialogActions = _interopRequireDefault(require("@mui/material/DialogActions"));
var _usePickerTranslations = require("../hooks/usePickerTranslations");
var _hooks = require("../hooks");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["actions"];
const PickersActionBarRoot = (0, _styles.styled)(_DialogActions.default, {
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
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const translations = (0, _usePickerTranslations.usePickerTranslations)();
  const {
    clearValue,
    setValueToToday,
    acceptValueChanges,
    cancelValueChanges,
    goToNextStep,
    hasNextStep
  } = (0, _hooks.usePickerContext)();
  if (actions == null || actions.length === 0) {
    return null;
  }
  const buttons = actions?.map(actionType => {
    switch (actionType) {
      case 'clear':
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
          onClick: clearValue,
          children: translations.clearButtonLabel
        }, actionType);
      case 'cancel':
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
          onClick: cancelValueChanges,
          children: translations.cancelButtonLabel
        }, actionType);
      case 'accept':
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
          onClick: acceptValueChanges,
          children: translations.okButtonLabel
        }, actionType);
      case 'today':
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
          onClick: setValueToToday,
          children: translations.todayButtonLabel
        }, actionType);
      case 'next':
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
          onClick: goToNextStep,
          children: translations.nextStepButtonLabel
        }, actionType);
      case 'nextOrAccept':
        if (hasNextStep) {
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
            onClick: goToNextStep,
            children: translations.nextStepButtonLabel
          }, actionType);
        }
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Button.default, {
          onClick: acceptValueChanges,
          children: translations.okButtonLabel
        }, actionType);
      default:
        return null;
    }
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersActionBarRoot, (0, _extends2.default)({}, other, {
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
  actions: _propTypes.default.arrayOf(_propTypes.default.oneOf(['accept', 'cancel', 'clear', 'next', 'nextOrAccept', 'today']).isRequired),
  /**
   * If `true`, the actions do not have additional margin.
   * @default false
   */
  disableSpacing: _propTypes.default.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;
const PickersActionBar = exports.PickersActionBar = /*#__PURE__*/React.memo(PickersActionBarComponent);
if (process.env.NODE_ENV !== "production") PickersActionBar.displayName = "PickersActionBar";
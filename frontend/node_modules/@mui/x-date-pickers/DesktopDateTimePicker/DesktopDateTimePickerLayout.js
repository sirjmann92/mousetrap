"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DesktopDateTimePickerLayout = void 0;
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _Divider = _interopRequireDefault(require("@mui/material/Divider"));
var _PickersLayout = require("../PickersLayout");
var _usePickerContext = require("../hooks/usePickerContext");
var _jsxRuntime = require("react/jsx-runtime");
/**
 * @ignore - internal component.
 */
const DesktopDateTimePickerLayout = exports.DesktopDateTimePickerLayout = /*#__PURE__*/React.forwardRef(function DesktopDateTimePickerLayout(props, ref) {
  const {
    toolbar,
    tabs,
    content,
    actionBar,
    shortcuts,
    ownerState
  } = (0, _PickersLayout.usePickerLayout)(props);
  const {
    orientation
  } = (0, _usePickerContext.usePickerContext)();
  const {
    sx,
    className,
    classes
  } = props;
  const isActionBarVisible = actionBar && (actionBar.props.actions?.length ?? 0) > 0;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_PickersLayout.PickersLayoutRoot, {
    ref: ref,
    className: (0, _clsx.default)(_PickersLayout.pickersLayoutClasses.root, classes?.root, className),
    sx: [{
      [`& .${_PickersLayout.pickersLayoutClasses.tabs}`]: {
        gridRow: 4,
        gridColumn: '1 / 4'
      },
      [`& .${_PickersLayout.pickersLayoutClasses.actionBar}`]: {
        gridRow: 5
      }
    }, ...(Array.isArray(sx) ? sx : [sx])],
    ownerState: ownerState,
    children: [orientation === 'landscape' ? shortcuts : toolbar, orientation === 'landscape' ? toolbar : shortcuts, /*#__PURE__*/(0, _jsxRuntime.jsxs)(_PickersLayout.PickersLayoutContentWrapper, {
      className: (0, _clsx.default)(_PickersLayout.pickersLayoutClasses.contentWrapper, classes?.contentWrapper),
      ownerState: ownerState,
      sx: {
        display: 'grid'
      },
      children: [content, tabs, isActionBarVisible && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Divider.default, {
        sx: {
          gridRow: 3,
          gridColumn: '1 / 4'
        }
      })]
    }), actionBar]
  });
});
if (process.env.NODE_ENV !== "production") DesktopDateTimePickerLayout.displayName = "DesktopDateTimePickerLayout";
process.env.NODE_ENV !== "production" ? DesktopDateTimePickerLayout.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  children: _propTypes.default.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: _propTypes.default.object,
  className: _propTypes.default.string,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: _propTypes.default.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: _propTypes.default.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.object, _propTypes.default.bool])), _propTypes.default.func, _propTypes.default.object])
} : void 0;
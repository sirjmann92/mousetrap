"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PickersLayoutRoot = exports.PickersLayoutContentWrapper = exports.PickersLayout = void 0;
var React = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _clsx = _interopRequireDefault(require("clsx"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _pickersLayoutClasses = require("./pickersLayoutClasses");
var _usePickerLayout = _interopRequireDefault(require("./usePickerLayout"));
var _usePickerContext = require("../hooks/usePickerContext");
var _jsxRuntime = require("react/jsx-runtime");
const useUtilityClasses = (classes, ownerState) => {
  const {
    pickerOrientation
  } = ownerState;
  const slots = {
    root: ['root', pickerOrientation === 'landscape' && 'landscape'],
    contentWrapper: ['contentWrapper']
  };
  return (0, _composeClasses.default)(slots, _pickersLayoutClasses.getPickersLayoutUtilityClass, classes);
};
const PickersLayoutRoot = exports.PickersLayoutRoot = (0, _styles.styled)('div', {
  name: 'MuiPickersLayout',
  slot: 'Root'
})({
  display: 'grid',
  gridAutoColumns: 'max-content auto max-content',
  gridAutoRows: 'max-content auto max-content',
  [`& .${_pickersLayoutClasses.pickersLayoutClasses.actionBar}`]: {
    gridColumn: '1 / 4',
    gridRow: 3
  },
  variants: [{
    props: {
      pickerOrientation: 'landscape'
    },
    style: {
      [`& .${_pickersLayoutClasses.pickersLayoutClasses.toolbar}`]: {
        gridColumn: 1,
        gridRow: '2 / 3'
      },
      [`.${_pickersLayoutClasses.pickersLayoutClasses.shortcuts}`]: {
        gridColumn: '2 / 4',
        gridRow: 1
      }
    }
  }, {
    props: {
      pickerOrientation: 'landscape',
      layoutDirection: 'rtl'
    },
    style: {
      [`& .${_pickersLayoutClasses.pickersLayoutClasses.toolbar}`]: {
        gridColumn: 3
      }
    }
  }, {
    props: {
      pickerOrientation: 'portrait'
    },
    style: {
      [`& .${_pickersLayoutClasses.pickersLayoutClasses.toolbar}`]: {
        gridColumn: '2 / 4',
        gridRow: 1
      },
      [`& .${_pickersLayoutClasses.pickersLayoutClasses.shortcuts}`]: {
        gridColumn: 1,
        gridRow: '2 / 3'
      }
    }
  }, {
    props: {
      pickerOrientation: 'portrait',
      layoutDirection: 'rtl'
    },
    style: {
      [`& .${_pickersLayoutClasses.pickersLayoutClasses.shortcuts}`]: {
        gridColumn: 4
      }
    }
  }]
});
const PickersLayoutContentWrapper = exports.PickersLayoutContentWrapper = (0, _styles.styled)('div', {
  name: 'MuiPickersLayout',
  slot: 'ContentWrapper'
})({
  gridColumn: '2 / 4',
  gridRow: 2,
  display: 'flex',
  flexDirection: 'column'
});
/**
 * Demos:
 *
 * - [Custom layout](https://mui.com/x/react-date-pickers/custom-layout/)
 *
 * API:
 *
 * - [PickersLayout API](https://mui.com/x/api/date-pickers/pickers-layout/)
 */
const PickersLayout = exports.PickersLayout = /*#__PURE__*/React.forwardRef(function PickersLayout(inProps, ref) {
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiPickersLayout'
  });
  const {
    toolbar,
    content,
    tabs,
    actionBar,
    shortcuts,
    ownerState
  } = (0, _usePickerLayout.default)(props);
  const {
    orientation,
    variant
  } = (0, _usePickerContext.usePickerContext)();
  const {
    sx,
    className,
    classes: classesProp
  } = props;
  const classes = useUtilityClasses(classesProp, ownerState);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(PickersLayoutRoot, {
    ref: ref,
    sx: sx,
    className: (0, _clsx.default)(classes.root, className),
    ownerState: ownerState,
    children: [orientation === 'landscape' ? shortcuts : toolbar, orientation === 'landscape' ? toolbar : shortcuts, /*#__PURE__*/(0, _jsxRuntime.jsx)(PickersLayoutContentWrapper, {
      className: classes.contentWrapper,
      ownerState: ownerState,
      children: variant === 'desktop' ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
        children: [content, tabs]
      }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)(React.Fragment, {
        children: [tabs, content]
      })
    }), actionBar]
  });
});
if (process.env.NODE_ENV !== "production") PickersLayout.displayName = "PickersLayout";
process.env.NODE_ENV !== "production" ? PickersLayout.propTypes = {
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
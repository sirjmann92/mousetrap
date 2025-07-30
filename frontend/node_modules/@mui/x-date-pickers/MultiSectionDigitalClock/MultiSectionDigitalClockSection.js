"use strict";
'use client';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiSectionDigitalClockSection = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));
var React = _interopRequireWildcard(require("react"));
var _clsx = _interopRequireDefault(require("clsx"));
var _styles = require("@mui/material/styles");
var _composeClasses = _interopRequireDefault(require("@mui/utils/composeClasses"));
var _MenuList = _interopRequireDefault(require("@mui/material/MenuList"));
var _MenuItem = _interopRequireDefault(require("@mui/material/MenuItem"));
var _useForkRef = _interopRequireDefault(require("@mui/utils/useForkRef"));
var _useEnhancedEffect = _interopRequireDefault(require("@mui/utils/useEnhancedEffect"));
var _multiSectionDigitalClockSectionClasses = require("./multiSectionDigitalClockSectionClasses");
var _dimensions = require("../internals/constants/dimensions");
var _utils = require("../internals/utils/utils");
var _usePickerPrivateContext = require("../internals/hooks/usePickerPrivateContext");
var _jsxRuntime = require("react/jsx-runtime");
const _excluded = ["autoFocus", "onChange", "className", "classes", "disabled", "readOnly", "items", "active", "slots", "slotProps", "skipDisabled"];
const useUtilityClasses = classes => {
  const slots = {
    root: ['root'],
    item: ['item']
  };
  return (0, _composeClasses.default)(slots, _multiSectionDigitalClockSectionClasses.getMultiSectionDigitalClockSectionUtilityClass, classes);
};
const MultiSectionDigitalClockSectionRoot = (0, _styles.styled)(_MenuList.default, {
  name: 'MuiMultiSectionDigitalClockSection',
  slot: 'Root'
})(({
  theme
}) => ({
  maxHeight: _dimensions.DIGITAL_CLOCK_VIEW_HEIGHT,
  width: 56,
  padding: 0,
  overflow: 'hidden',
  scrollbarWidth: 'thin',
  '@media (prefers-reduced-motion: no-preference)': {
    scrollBehavior: 'auto'
  },
  '@media (pointer: fine)': {
    '&:hover': {
      overflowY: 'auto'
    }
  },
  '@media (pointer: none), (pointer: coarse)': {
    overflowY: 'auto'
  },
  '&:not(:first-of-type)': {
    borderLeft: `1px solid ${(theme.vars || theme).palette.divider}`
  },
  '&::after': {
    display: 'block',
    content: '""',
    // subtracting the height of one item, extra margin and borders to make sure the max height is correct
    height: 'calc(100% - 40px - 6px)'
  },
  variants: [{
    props: {
      hasDigitalClockAlreadyBeenRendered: true
    },
    style: {
      '@media (prefers-reduced-motion: no-preference)': {
        scrollBehavior: 'smooth'
      }
    }
  }]
}));
const MultiSectionDigitalClockSectionItem = (0, _styles.styled)(_MenuItem.default, {
  name: 'MuiMultiSectionDigitalClockSection',
  slot: 'Item'
})(({
  theme
}) => ({
  padding: 8,
  margin: '2px 4px',
  width: _dimensions.MULTI_SECTION_CLOCK_SECTION_WIDTH,
  justifyContent: 'center',
  '&:first-of-type': {
    marginTop: 4
  },
  '&:hover': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.hoverOpacity})` : (0, _styles.alpha)(theme.palette.primary.main, theme.palette.action.hoverOpacity)
  },
  '&.Mui-selected': {
    backgroundColor: (theme.vars || theme).palette.primary.main,
    color: (theme.vars || theme).palette.primary.contrastText,
    '&:focus-visible, &:hover': {
      backgroundColor: (theme.vars || theme).palette.primary.dark
    }
  },
  '&.Mui-focusVisible': {
    backgroundColor: theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.focusOpacity})` : (0, _styles.alpha)(theme.palette.primary.main, theme.palette.action.focusOpacity)
  }
}));
/**
 * @ignore - internal component.
 */
const MultiSectionDigitalClockSection = exports.MultiSectionDigitalClockSection = /*#__PURE__*/React.forwardRef(function MultiSectionDigitalClockSection(inProps, ref) {
  const containerRef = React.useRef(null);
  const handleRef = (0, _useForkRef.default)(ref, containerRef);
  const previousActive = React.useRef(null);
  const props = (0, _styles.useThemeProps)({
    props: inProps,
    name: 'MuiMultiSectionDigitalClockSection'
  });
  const {
      autoFocus,
      onChange,
      className,
      classes: classesProp,
      disabled,
      readOnly,
      items,
      active,
      slots,
      slotProps,
      skipDisabled
    } = props,
    other = (0, _objectWithoutPropertiesLoose2.default)(props, _excluded);
  const {
    ownerState: pickerOwnerState
  } = (0, _usePickerPrivateContext.usePickerPrivateContext)();
  const ownerState = (0, _extends2.default)({}, pickerOwnerState, {
    hasDigitalClockAlreadyBeenRendered: !!containerRef.current
  });
  const classes = useUtilityClasses(classesProp);
  const DigitalClockSectionItem = slots?.digitalClockSectionItem ?? MultiSectionDigitalClockSectionItem;
  (0, _useEnhancedEffect.default)(() => {
    if (containerRef.current === null) {
      return;
    }
    const activeItem = containerRef.current.querySelector('[role="option"][tabindex="0"], [role="option"][aria-selected="true"]');
    if (active && autoFocus && activeItem) {
      activeItem.focus();
    }
    if (!activeItem || previousActive.current === activeItem) {
      return;
    }
    previousActive.current = activeItem;
    const offsetTop = activeItem.offsetTop;

    // Subtracting the 4px of extra margin intended for the first visible section item
    containerRef.current.scrollTop = offsetTop - 4;
  });
  const focusedOptionIndex = items.findIndex(item => item.isFocused(item.value));
  const handleKeyDown = event => {
    switch (event.key) {
      case 'PageUp':
        {
          const newIndex = (0, _utils.getFocusedListItemIndex)(containerRef.current) - 5;
          const children = containerRef.current.children;
          const newFocusedIndex = Math.max(0, newIndex);
          const childToFocus = children[newFocusedIndex];
          if (childToFocus) {
            childToFocus.focus();
          }
          event.preventDefault();
          break;
        }
      case 'PageDown':
        {
          const newIndex = (0, _utils.getFocusedListItemIndex)(containerRef.current) + 5;
          const children = containerRef.current.children;
          const newFocusedIndex = Math.min(children.length - 1, newIndex);
          const childToFocus = children[newFocusedIndex];
          if (childToFocus) {
            childToFocus.focus();
          }
          event.preventDefault();
          break;
        }
      default:
    }
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(MultiSectionDigitalClockSectionRoot, (0, _extends2.default)({
    ref: handleRef,
    className: (0, _clsx.default)(classes.root, className),
    ownerState: ownerState,
    autoFocusItem: autoFocus && active,
    role: "listbox",
    onKeyDown: handleKeyDown
  }, other, {
    children: items.map((option, index) => {
      const isItemDisabled = option.isDisabled?.(option.value);
      const isDisabled = disabled || isItemDisabled;
      if (skipDisabled && isDisabled) {
        return null;
      }
      const isSelected = option.isSelected(option.value);
      const tabIndex = focusedOptionIndex === index || focusedOptionIndex === -1 && index === 0 ? 0 : -1;
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(DigitalClockSectionItem, (0, _extends2.default)({
        onClick: () => !readOnly && onChange(option.value),
        selected: isSelected,
        disabled: isDisabled,
        disableRipple: readOnly,
        role: "option"
        // aria-readonly is not supported here and does not have any effect
        ,
        "aria-disabled": readOnly || isDisabled || undefined,
        "aria-label": option.ariaLabel,
        "aria-selected": isSelected,
        tabIndex: tabIndex,
        className: classes.item
      }, slotProps?.digitalClockSectionItem, {
        children: option.label
      }), option.label);
    })
  }));
});
if (process.env.NODE_ENV !== "production") MultiSectionDigitalClockSection.displayName = "MultiSectionDigitalClockSection";
import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import clsx from 'clsx';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { styled, useThemeProps } from '@mui/material/styles';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import composeClasses from '@mui/utils/composeClasses';
import { ClockPointer } from "./ClockPointer.js";
import { usePickerAdapter, usePickerTranslations } from "../hooks/index.js";
import { CLOCK_HOUR_WIDTH, getHours, getMinutes } from "./shared.js";
import { getClockUtilityClass } from "./clockClasses.js";
import { formatMeridiem } from "../internals/utils/date-utils.js";
import { usePickerPrivateContext } from "../internals/hooks/usePickerPrivateContext.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const useUtilityClasses = (classes, ownerState) => {
  const slots = {
    root: ['root'],
    clock: ['clock'],
    wrapper: ['wrapper'],
    squareMask: ['squareMask'],
    pin: ['pin'],
    amButton: ['amButton', ownerState.clockMeridiemMode === 'am' && 'selected'],
    pmButton: ['pmButton', ownerState.clockMeridiemMode === 'pm' && 'selected'],
    meridiemText: ['meridiemText']
  };
  return composeClasses(slots, getClockUtilityClass, classes);
};
const ClockRoot = styled('div', {
  name: 'MuiClock',
  slot: 'Root'
})(({
  theme
}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: theme.spacing(2)
}));
const ClockClock = styled('div', {
  name: 'MuiClock',
  slot: 'Clock'
})({
  backgroundColor: 'rgba(0,0,0,.07)',
  borderRadius: '50%',
  height: 220,
  width: 220,
  flexShrink: 0,
  position: 'relative',
  pointerEvents: 'none'
});
const ClockWrapper = styled('div', {
  name: 'MuiClock',
  slot: 'Wrapper'
})({
  '&:focus': {
    outline: 'none'
  }
});
const ClockSquareMask = styled('div', {
  name: 'MuiClock',
  slot: 'SquareMask'
})({
  width: '100%',
  height: '100%',
  position: 'absolute',
  pointerEvents: 'auto',
  outline: 0,
  // Disable scroll capabilities.
  touchAction: 'none',
  userSelect: 'none',
  variants: [{
    props: {
      isClockDisabled: false
    },
    style: {
      '@media (pointer: fine)': {
        cursor: 'pointer',
        borderRadius: '50%'
      },
      '&:active': {
        cursor: 'move'
      }
    }
  }]
});
const ClockPin = styled('div', {
  name: 'MuiClock',
  slot: 'Pin'
})(({
  theme
}) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: (theme.vars || theme).palette.primary.main,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
}));
const meridiemButtonCommonStyles = (theme, clockMeridiemMode) => ({
  zIndex: 1,
  bottom: 8,
  paddingLeft: 4,
  paddingRight: 4,
  width: CLOCK_HOUR_WIDTH,
  variants: [{
    props: {
      clockMeridiemMode
    },
    style: {
      backgroundColor: (theme.vars || theme).palette.primary.main,
      color: (theme.vars || theme).palette.primary.contrastText,
      '&:hover': {
        backgroundColor: (theme.vars || theme).palette.primary.light
      }
    }
  }]
});
const ClockAmButton = styled(IconButton, {
  name: 'MuiClock',
  slot: 'AmButton'
})(({
  theme
}) => _extends({}, meridiemButtonCommonStyles(theme, 'am'), {
  // keeping it here to make TS happy
  position: 'absolute',
  left: 8
}));
const ClockPmButton = styled(IconButton, {
  name: 'MuiClock',
  slot: 'PmButton'
})(({
  theme
}) => _extends({}, meridiemButtonCommonStyles(theme, 'pm'), {
  // keeping it here to make TS happy
  position: 'absolute',
  right: 8
}));
const ClockMeridiemText = styled(Typography, {
  name: 'MuiClock',
  slot: 'MeridiemText'
})({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis'
});

/**
 * @ignore - internal component.
 */
export function Clock(inProps) {
  const props = useThemeProps({
    props: inProps,
    name: 'MuiClock'
  });
  const {
    ampm,
    ampmInClock,
    autoFocus,
    children,
    value,
    handleMeridiemChange,
    isTimeDisabled,
    meridiemMode,
    minutesStep = 1,
    onChange,
    selectedId,
    type,
    viewValue,
    viewRange: [minViewValue, maxViewValue],
    disabled = false,
    readOnly,
    className,
    classes: classesProp
  } = props;
  const adapter = usePickerAdapter();
  const translations = usePickerTranslations();
  const {
    ownerState: pickerOwnerState
  } = usePickerPrivateContext();
  const ownerState = _extends({}, pickerOwnerState, {
    isClockDisabled: disabled,
    clockMeridiemMode: meridiemMode
  });
  const isMoving = React.useRef(false);
  const classes = useUtilityClasses(classesProp, ownerState);
  const isSelectedTimeDisabled = isTimeDisabled(viewValue, type);
  const isPointerInner = !ampm && type === 'hours' && (viewValue < 1 || viewValue > 12);
  const handleValueChange = (newValue, isFinish) => {
    if (disabled || readOnly) {
      return;
    }
    if (isTimeDisabled(newValue, type)) {
      return;
    }
    onChange(newValue, isFinish);
  };
  const setTime = (event, isFinish) => {
    let {
      offsetX,
      offsetY
    } = event;
    if (offsetX === undefined) {
      const rect = event.target.getBoundingClientRect();
      offsetX = event.changedTouches[0].clientX - rect.left;
      offsetY = event.changedTouches[0].clientY - rect.top;
    }
    const newSelectedValue = type === 'seconds' || type === 'minutes' ? getMinutes(offsetX, offsetY, minutesStep) : getHours(offsetX, offsetY, Boolean(ampm));
    handleValueChange(newSelectedValue, isFinish);
  };
  const handleTouchSelection = event => {
    isMoving.current = true;
    setTime(event, 'shallow');
  };
  const handleTouchEnd = event => {
    if (isMoving.current) {
      setTime(event, 'finish');
      isMoving.current = false;
    }
    event.preventDefault();
  };
  const handleMouseMove = event => {
    // event.buttons & PRIMARY_MOUSE_BUTTON
    if (event.buttons > 0) {
      setTime(event.nativeEvent, 'shallow');
    }
  };
  const handleMouseUp = event => {
    if (isMoving.current) {
      isMoving.current = false;
    }
    setTime(event.nativeEvent, 'finish');
  };
  const isPointerBetweenTwoClockValues = type === 'hours' ? false : viewValue % 5 !== 0;
  const keyboardControlStep = type === 'minutes' ? minutesStep : 1;
  const listboxRef = React.useRef(null);
  // Since this is rendered when a Popper is opened we can't use passive effects.
  // Focusing in passive effects in Popper causes scroll jump.
  useEnhancedEffect(() => {
    if (autoFocus) {
      // The ref not being resolved would be a bug in MUI.
      listboxRef.current.focus();
    }
  }, [autoFocus]);
  const clampValue = newValue => Math.max(minViewValue, Math.min(maxViewValue, newValue));
  const circleValue = newValue => (newValue + (maxViewValue + 1)) % (maxViewValue + 1);
  const handleKeyDown = event => {
    // TODO: Why this early exit?
    if (isMoving.current) {
      return;
    }
    switch (event.key) {
      case 'Home':
        // reset both hours and minutes
        handleValueChange(minViewValue, 'partial');
        event.preventDefault();
        break;
      case 'End':
        handleValueChange(maxViewValue, 'partial');
        event.preventDefault();
        break;
      case 'ArrowUp':
        handleValueChange(circleValue(viewValue + keyboardControlStep), 'partial');
        event.preventDefault();
        break;
      case 'ArrowDown':
        handleValueChange(circleValue(viewValue - keyboardControlStep), 'partial');
        event.preventDefault();
        break;
      case 'PageUp':
        handleValueChange(clampValue(viewValue + 5), 'partial');
        event.preventDefault();
        break;
      case 'PageDown':
        handleValueChange(clampValue(viewValue - 5), 'partial');
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        handleValueChange(viewValue, 'finish');
        event.preventDefault();
        break;
      default:
      // do nothing
    }
  };
  return /*#__PURE__*/_jsxs(ClockRoot, {
    className: clsx(classes.root, className),
    children: [/*#__PURE__*/_jsxs(ClockClock, {
      className: classes.clock,
      children: [/*#__PURE__*/_jsx(ClockSquareMask, {
        onTouchMove: handleTouchSelection,
        onTouchStart: handleTouchSelection,
        onTouchEnd: handleTouchEnd,
        onMouseUp: handleMouseUp,
        onMouseMove: handleMouseMove,
        ownerState: ownerState,
        className: classes.squareMask
      }), !isSelectedTimeDisabled && /*#__PURE__*/_jsxs(React.Fragment, {
        children: [/*#__PURE__*/_jsx(ClockPin, {
          className: classes.pin
        }), value != null && /*#__PURE__*/_jsx(ClockPointer, {
          type: type,
          viewValue: viewValue,
          isInner: isPointerInner,
          isBetweenTwoClockValues: isPointerBetweenTwoClockValues
        })]
      }), /*#__PURE__*/_jsx(ClockWrapper, {
        "aria-activedescendant": selectedId,
        "aria-label": translations.clockLabelText(type, value == null ? null : adapter.format(value, ampm ? 'fullTime12h' : 'fullTime24h')),
        ref: listboxRef,
        role: "listbox",
        onKeyDown: handleKeyDown,
        tabIndex: 0,
        className: classes.wrapper,
        children: children
      })]
    }), ampm && ampmInClock && /*#__PURE__*/_jsxs(React.Fragment, {
      children: [/*#__PURE__*/_jsx(ClockAmButton, {
        onClick: readOnly ? undefined : () => handleMeridiemChange('am'),
        disabled: disabled || meridiemMode === null,
        ownerState: ownerState,
        className: classes.amButton,
        title: formatMeridiem(adapter, 'am'),
        children: /*#__PURE__*/_jsx(ClockMeridiemText, {
          variant: "caption",
          className: classes.meridiemText,
          children: formatMeridiem(adapter, 'am')
        })
      }), /*#__PURE__*/_jsx(ClockPmButton, {
        disabled: disabled || meridiemMode === null,
        onClick: readOnly ? undefined : () => handleMeridiemChange('pm'),
        ownerState: ownerState,
        className: classes.pmButton,
        title: formatMeridiem(adapter, 'pm'),
        children: /*#__PURE__*/_jsx(ClockMeridiemText, {
          variant: "caption",
          className: classes.meridiemText,
          children: formatMeridiem(adapter, 'pm')
        })
      })]
    })]
  });
}
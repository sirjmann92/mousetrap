import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["quickFilterParser", "quickFilterFormatter", "debounceMs", "className", "slotProps"],
  _excluded2 = ["ref", "slotProps"];
import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { styled } from '@mui/system';
import clsx from 'clsx';
import { getDataGridUtilityClass } from "../../constants/index.js";
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { QuickFilter, QuickFilterClear, QuickFilterControl, QuickFilterTrigger } from "../quickFilter/index.js";
import { ToolbarButton } from "../toolbarV8/index.js";
import { vars } from "../../constants/cssVariables.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ['toolbarQuickFilter'],
    trigger: ['toolbarQuickFilterTrigger'],
    control: ['toolbarQuickFilterControl']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const GridQuickFilterRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'ToolbarQuickFilter'
})({
  display: 'grid',
  alignItems: 'center'
});
const GridQuickFilterTrigger = styled(ToolbarButton, {
  name: 'MuiDataGrid',
  slot: 'ToolbarQuickFilterTrigger'
})(({
  ownerState
}) => ({
  gridArea: '1 / 1',
  width: 'min-content',
  height: 'min-content',
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: vars.transition(['opacity'])
}));

// TODO: Use NotRendered from /utils/assert
// Currently causes react-docgen to fail
const GridQuickFilterTextField = styled(_props => {
  throw new Error('Failed assertion: should not be rendered');
}, {
  name: 'MuiDataGrid',
  slot: 'ToolbarQuickFilterControl'
})(({
  ownerState
}) => ({
  gridArea: '1 / 1',
  overflowX: 'clip',
  width: ownerState.expanded ? 260 : 'var(--trigger-width)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: vars.transition(['width', 'opacity'])
}));

/**
 * @deprecated Use the {@link https://mui.com/x/react-data-grid/components/quick-filter/ Quick Filter} component instead. This component will be removed in a future major release.
 */
function GridToolbarQuickFilter(props) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const ownerState = {
    classes: rootProps.classes,
    expanded: false
  };
  const classes = useUtilityClasses(ownerState);
  const {
      quickFilterParser,
      quickFilterFormatter,
      debounceMs,
      className,
      slotProps
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  return /*#__PURE__*/_jsx(QuickFilter, {
    parser: quickFilterParser,
    formatter: quickFilterFormatter,
    debounceMs: debounceMs,
    render: (quickFilterProps, state) => {
      const currentOwnerState = _extends({}, ownerState, {
        expanded: state.expanded
      });
      return /*#__PURE__*/_jsxs(GridQuickFilterRoot, _extends({}, quickFilterProps, {
        className: clsx(classes.root, className),
        children: [/*#__PURE__*/_jsx(QuickFilterTrigger, {
          render: triggerProps => /*#__PURE__*/_jsx(rootProps.slots.baseTooltip, {
            title: apiRef.current.getLocaleText('toolbarQuickFilterLabel'),
            enterDelay: 0 // Prevents tooltip lagging behind transitioning trigger element
            ,
            children: /*#__PURE__*/_jsx(GridQuickFilterTrigger, _extends({
              className: classes.trigger
            }, triggerProps, {
              ownerState: currentOwnerState,
              color: "default",
              "aria-disabled": state.expanded,
              children: /*#__PURE__*/_jsx(rootProps.slots.quickFilterIcon, {
                fontSize: "small"
              })
            }))
          })
        }), /*#__PURE__*/_jsx(QuickFilterControl, {
          render: _ref => {
            let {
                ref,
                slotProps: controlSlotProps
              } = _ref,
              controlProps = _objectWithoutPropertiesLoose(_ref, _excluded2);
            return /*#__PURE__*/_jsx(GridQuickFilterTextField, _extends({
              as: rootProps.slots.baseTextField,
              className: classes.control,
              ownerState: currentOwnerState,
              inputRef: ref,
              "aria-label": apiRef.current.getLocaleText('toolbarQuickFilterLabel'),
              placeholder: apiRef.current.getLocaleText('toolbarQuickFilterPlaceholder'),
              size: "small",
              slotProps: _extends({
                input: _extends({
                  startAdornment: /*#__PURE__*/_jsx(rootProps.slots.quickFilterIcon, {
                    fontSize: "small"
                  }),
                  endAdornment: controlProps.value ? /*#__PURE__*/_jsx(QuickFilterClear, {
                    render: /*#__PURE__*/_jsx(rootProps.slots.baseIconButton, {
                      size: "small",
                      edge: "end",
                      "aria-label": apiRef.current.getLocaleText('toolbarQuickFilterDeleteIconLabel'),
                      children: /*#__PURE__*/_jsx(rootProps.slots.quickFilterClearIcon, {
                        fontSize: "small"
                      })
                    })
                  }) : null
                }, controlSlotProps?.input)
              }, controlSlotProps)
            }, rootProps.slotProps?.baseTextField, controlProps, slotProps?.root, other));
          }
        })]
      }));
    }
  });
}
process.env.NODE_ENV !== "production" ? GridToolbarQuickFilter.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: PropTypes.string,
  /**
   * The debounce time in milliseconds.
   * @default 150
   */
  debounceMs: PropTypes.number,
  /**
   * Function responsible for formatting values of quick filter in a string when the model is modified
   * @param {any[]} values The new values passed to the quick filter model
   * @returns {string} The string to display in the text field
   * @default (values: string[]) => values.join(' ')
   */
  quickFilterFormatter: PropTypes.func,
  /**
   * Function responsible for parsing text input in an array of independent values for quick filtering.
   * @param {string} input The value entered by the user
   * @returns {any[]} The array of value on which quick filter is applied
   * @default (searchText: string) => searchText
   *   .split(' ')
   *   .filter((word) => word !== '')
   */
  quickFilterParser: PropTypes.func,
  slotProps: PropTypes.object
} : void 0;

/**
 * Demos:
 * - [Filtering - overview](https://mui.com/x/react-data-grid/filtering/)
 * - [Filtering - quick filter](https://mui.com/x/react-data-grid/filtering/quick-filter/)
 *
 * API:
 * - [GridToolbarQuickFilter API](https://mui.com/x/api/data-grid/grid-toolbar-quick-filter/)
 */
export { GridToolbarQuickFilter };
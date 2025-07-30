'use client';

import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["className"],
  _excluded2 = ["className"];
import * as React from 'react';
import PropTypes from 'prop-types';
import useId from '@mui/utils/useId';
import { styled } from '@mui/system';
import composeClasses from '@mui/utils/composeClasses';
import { GridMenu } from "../menu/GridMenu.js";
import { Toolbar } from "./Toolbar.js";
import { ToolbarButton } from "./ToolbarButton.js";
import { FilterPanelTrigger } from "../filterPanel/index.js";
import { ColumnsPanelTrigger } from "../columnsPanel/index.js";
import { ExportCsv, ExportPrint } from "../export/index.js";
import { GridToolbarQuickFilter } from "../toolbar/GridToolbarQuickFilter.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { NotRendered } from "../../utils/assert.js";
import { vars } from "../../constants/cssVariables.js";
import { getDataGridUtilityClass } from "../../constants/gridClasses.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const useUtilityClasses = ownerState => {
  const {
    classes
  } = ownerState;
  const slots = {
    divider: ['toolbarDivider'],
    label: ['toolbarLabel']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};
const Divider = styled(NotRendered, {
  name: 'MuiDataGrid',
  slot: 'ToolbarDivider'
})({
  height: '50%',
  margin: vars.spacing(0, 0.5)
});
const Label = styled('span', {
  name: 'MuiDataGrid',
  slot: 'ToolbarLabel'
})({
  flex: 1,
  font: vars.typography.font.large,
  fontWeight: vars.typography.fontWeight.medium,
  margin: vars.spacing(0, 0.5),
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap'
});
function GridToolbarDivider(props) {
  const other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/_jsx(Divider, _extends({
    as: rootProps.slots.baseDivider,
    orientation: "vertical",
    className: classes.divider
  }, other));
}
process.env.NODE_ENV !== "production" ? GridToolbarDivider.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: PropTypes.string,
  orientation: PropTypes.oneOf(['horizontal', 'vertical'])
} : void 0;
function GridToolbarLabel(props) {
  const other = _objectWithoutPropertiesLoose(props, _excluded2);
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  return /*#__PURE__*/_jsx(Label, _extends({
    className: classes.label
  }, other));
}
function GridToolbar(props) {
  const {
    showQuickFilter = true,
    quickFilterProps,
    csvOptions,
    printOptions,
    additionalItems,
    additionalExportMenuItems
  } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const [exportMenuOpen, setExportMenuOpen] = React.useState(false);
  const exportMenuTriggerRef = React.useRef(null);
  const exportMenuId = useId();
  const exportMenuTriggerId = useId();
  const showExportMenu = !csvOptions?.disableToolbarButton || !printOptions?.disableToolbarButton || additionalExportMenuItems;
  const closeExportMenu = () => setExportMenuOpen(false);
  return /*#__PURE__*/_jsxs(Toolbar, {
    children: [rootProps.label && /*#__PURE__*/_jsx(GridToolbarLabel, {
      children: rootProps.label
    }), !rootProps.disableColumnSelector && /*#__PURE__*/_jsx(rootProps.slots.baseTooltip, {
      title: apiRef.current.getLocaleText('toolbarColumns'),
      children: /*#__PURE__*/_jsx(ColumnsPanelTrigger, {
        render: /*#__PURE__*/_jsx(ToolbarButton, {}),
        children: /*#__PURE__*/_jsx(rootProps.slots.columnSelectorIcon, {
          fontSize: "small"
        })
      })
    }), !rootProps.disableColumnFilter && /*#__PURE__*/_jsx(rootProps.slots.baseTooltip, {
      title: apiRef.current.getLocaleText('toolbarFilters'),
      children: /*#__PURE__*/_jsx(FilterPanelTrigger, {
        render: (triggerProps, state) => /*#__PURE__*/_jsx(ToolbarButton, _extends({}, triggerProps, {
          color: state.filterCount > 0 ? 'primary' : 'default',
          children: /*#__PURE__*/_jsx(rootProps.slots.baseBadge, {
            badgeContent: state.filterCount,
            color: "primary",
            variant: "dot",
            children: /*#__PURE__*/_jsx(rootProps.slots.openFilterButtonIcon, {
              fontSize: "small"
            })
          })
        }))
      })
    }), additionalItems, showExportMenu && (!rootProps.disableColumnFilter || !rootProps.disableColumnSelector) && /*#__PURE__*/_jsx(GridToolbarDivider, {}), showExportMenu && /*#__PURE__*/_jsxs(React.Fragment, {
      children: [/*#__PURE__*/_jsx(rootProps.slots.baseTooltip, {
        title: apiRef.current.getLocaleText('toolbarExport'),
        disableInteractive: exportMenuOpen,
        children: /*#__PURE__*/_jsx(ToolbarButton, {
          ref: exportMenuTriggerRef,
          id: exportMenuTriggerId,
          "aria-controls": exportMenuId,
          "aria-haspopup": "true",
          "aria-expanded": exportMenuOpen ? 'true' : undefined,
          onClick: () => setExportMenuOpen(!exportMenuOpen),
          children: /*#__PURE__*/_jsx(rootProps.slots.exportIcon, {
            fontSize: "small"
          })
        })
      }), /*#__PURE__*/_jsx(GridMenu, {
        target: exportMenuTriggerRef.current,
        open: exportMenuOpen,
        onClose: closeExportMenu,
        position: "bottom-end",
        children: /*#__PURE__*/_jsxs(rootProps.slots.baseMenuList, _extends({
          id: exportMenuId,
          "aria-labelledby": exportMenuTriggerId,
          autoFocusItem: true
        }, rootProps.slotProps?.baseMenuList, {
          children: [!printOptions?.disableToolbarButton && /*#__PURE__*/_jsx(ExportPrint, {
            render: /*#__PURE__*/_jsx(rootProps.slots.baseMenuItem, _extends({}, rootProps.slotProps?.baseMenuItem)),
            options: printOptions,
            onClick: closeExportMenu,
            children: apiRef.current.getLocaleText('toolbarExportPrint')
          }), !csvOptions?.disableToolbarButton && /*#__PURE__*/_jsx(ExportCsv, {
            render: /*#__PURE__*/_jsx(rootProps.slots.baseMenuItem, _extends({}, rootProps.slotProps?.baseMenuItem)),
            options: csvOptions,
            onClick: closeExportMenu,
            children: apiRef.current.getLocaleText('toolbarExportCSV')
          }), additionalExportMenuItems?.(closeExportMenu)]
        }))
      })]
    }), showQuickFilter && /*#__PURE__*/_jsxs(React.Fragment, {
      children: [/*#__PURE__*/_jsx(GridToolbarDivider, {}), /*#__PURE__*/_jsx(GridToolbarQuickFilter, _extends({}, quickFilterProps))]
    })]
  });
}
process.env.NODE_ENV !== "production" ? GridToolbar.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  additionalExportMenuItems: PropTypes.func,
  additionalItems: PropTypes.node,
  csvOptions: PropTypes.object,
  printOptions: PropTypes.object,
  /**
   * Props passed to the quick filter component.
   */
  quickFilterProps: PropTypes.shape({
    className: PropTypes.string,
    debounceMs: PropTypes.number,
    quickFilterFormatter: PropTypes.func,
    quickFilterParser: PropTypes.func,
    slotProps: PropTypes.object
  }),
  /**
   * Show the quick filter component.
   * @default true
   */
  showQuickFilter: PropTypes.bool,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: PropTypes.object,
  sx: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])), PropTypes.func, PropTypes.object])
} : void 0;
export { GridToolbar, GridToolbarDivider, GridToolbarLabel };
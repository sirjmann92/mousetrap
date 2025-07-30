import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
const _excluded = ["render", "options", "onClick"];
import * as React from 'react';
import PropTypes from 'prop-types';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useComponentRenderer } from '@mui/x-internals/useComponentRenderer';
import { useGridApiContext } from "../../hooks/utils/useGridApiContext.js";
import { useGridRootProps } from "../../hooks/utils/useGridRootProps.js";
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * A button that triggers a CSV export.
 * It renders the `baseButton` slot.
 *
 * Demos:
 *
 * - [Export](https://mui.com/x/react-data-grid/components/export/)
 *
 * API:
 *
 * - [ExportCsv API](https://mui.com/x/api/data-grid/export-csv/)
 */
const ExportCsv = forwardRef(function ExportCsv(props, ref) {
  const {
      render,
      options,
      onClick
    } = props,
    other = _objectWithoutPropertiesLoose(props, _excluded);
  const rootProps = useGridRootProps();
  const apiRef = useGridApiContext();
  const handleClick = event => {
    apiRef.current.exportDataAsCsv(options);
    onClick?.(event);
  };
  const element = useComponentRenderer(rootProps.slots.baseButton, render, _extends({}, rootProps.slotProps?.baseButton, {
    onClick: handleClick
  }, other, {
    ref
  }));
  return /*#__PURE__*/_jsx(React.Fragment, {
    children: element
  });
});
if (process.env.NODE_ENV !== "production") ExportCsv.displayName = "ExportCsv";
process.env.NODE_ENV !== "production" ? ExportCsv.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  className: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
  /**
   * The options to apply on the CSV export.
   * @demos
   *   - [CSV export](/x/react-data-grid/export/#csv-export)
   */
  options: PropTypes.shape({
    allColumns: PropTypes.bool,
    delimiter: PropTypes.string,
    escapeFormulas: PropTypes.bool,
    fields: PropTypes.arrayOf(PropTypes.string),
    fileName: PropTypes.string,
    getRowsToExport: PropTypes.func,
    includeColumnGroupsHeaders: PropTypes.bool,
    includeHeaders: PropTypes.bool,
    shouldAppendQuotes: PropTypes.bool,
    utf8WithBom: PropTypes.bool
  }),
  /**
   * A function to customize rendering of the component.
   */
  render: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  role: PropTypes.string,
  size: PropTypes.oneOf(['large', 'medium', 'small']),
  startIcon: PropTypes.node,
  style: PropTypes.object,
  tabIndex: PropTypes.number,
  title: PropTypes.string,
  touchRippleRef: PropTypes.any
} : void 0;
export { ExportCsv };
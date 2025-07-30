"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.propValidatorsDataGrid = void 0;
exports.validateProps = validateProps;
var _warning = require("@mui/x-internals/warning");
var _utils = require("../../utils/utils");
var _signature = require("../../constants/signature");
const propValidatorsDataGrid = exports.propValidatorsDataGrid = [props => props.autoPageSize && props.autoHeight && ['MUI X: `<DataGrid autoPageSize={true} autoHeight={true} />` are not valid props.', 'You cannot use both the `autoPageSize` and `autoHeight` props at the same time because `autoHeight` scales the height of the Data Grid according to the `pageSize`.', '', 'Please remove one of these two props.'].join('\n') || undefined, props => props.paginationMode === 'client' && props.paginationMeta != null && ['MUI X: Usage of the `paginationMeta` prop with client-side pagination (`paginationMode="client"`) has no effect.', '`paginationMeta` is only meant to be used with `paginationMode="server"`.'].join('\n') || undefined, props => props.signature === _signature.GridSignature.DataGrid && props.paginationMode === 'client' && (0, _utils.isNumber)(props.rowCount) && ['MUI X: Usage of the `rowCount` prop with client side pagination (`paginationMode="client"`) has no effect.', '`rowCount` is only meant to be used with `paginationMode="server"`.'].join('\n') || undefined, props => props.paginationMode === 'server' && props.rowCount == null && !props.dataSource && ["MUI X: The `rowCount` prop must be passed using `paginationMode='server'`", 'For more detail, see http://mui.com/components/data-grid/pagination/#index-based-pagination'].join('\n') || undefined];
function validateProps(props, validators) {
  validators.forEach(validator => {
    const message = validator(props);
    if (message) {
      (0, _warning.warnOnce)(message, 'error');
    }
  });
}
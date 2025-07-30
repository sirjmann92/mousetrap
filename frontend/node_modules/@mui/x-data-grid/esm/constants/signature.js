/**
 * Signal to the underlying logic what version of the public component API
 * of the Data Grid is exposed.
 */
export let GridSignature = /*#__PURE__*/function (GridSignature) {
  GridSignature["DataGrid"] = "DataGrid";
  GridSignature["DataGridPro"] = "DataGridPro";
  GridSignature["DataGridPremium"] = "DataGridPremium";
  return GridSignature;
}({});
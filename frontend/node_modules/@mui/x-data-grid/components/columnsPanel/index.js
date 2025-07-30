"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ColumnsPanelTrigger = require("./ColumnsPanelTrigger");
Object.keys(_ColumnsPanelTrigger).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ColumnsPanelTrigger[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ColumnsPanelTrigger[key];
    }
  });
});
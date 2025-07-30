"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
require("../index.css");
var _DataGrid = require("./DataGrid");
Object.keys(_DataGrid).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _DataGrid[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _DataGrid[key];
    }
  });
});
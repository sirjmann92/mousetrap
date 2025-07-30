"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _ToolbarContext = require("./ToolbarContext");
Object.keys(_ToolbarContext).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ToolbarContext[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ToolbarContext[key];
    }
  });
});
var _useRegisterToolbarButton = require("./useRegisterToolbarButton");
Object.keys(_useRegisterToolbarButton).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _useRegisterToolbarButton[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useRegisterToolbarButton[key];
    }
  });
});
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRowSelectionManager = void 0;
class IncludeManager {
  constructor(model) {
    this.data = void 0;
    this.data = model.ids;
  }
  has(id) {
    return this.data.has(id);
  }
  select(id) {
    this.data.add(id);
  }
  unselect(id) {
    this.data.delete(id);
  }
}
class ExcludeManager {
  constructor(model) {
    this.data = void 0;
    this.data = model.ids;
  }
  has(id) {
    return !this.data.has(id);
  }
  select(id) {
    this.data.delete(id);
  }
  unselect(id) {
    this.data.add(id);
  }
}
const createRowSelectionManager = model => {
  if (model.type === 'include') {
    return new IncludeManager(model);
  }
  return new ExcludeManager(model);
};
exports.createRowSelectionManager = createRowSelectionManager;
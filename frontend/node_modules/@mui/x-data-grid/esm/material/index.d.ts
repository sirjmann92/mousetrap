import type { GridIconSlotsComponent } from "../models/index.js";
import type { GridBaseSlots } from "../models/gridSlotsComponent.js";
import "./augmentation.js";
export { useMaterialCSSVariables } from "./variables.js";
declare const materialSlots: GridBaseSlots & GridIconSlotsComponent;
export default materialSlots;
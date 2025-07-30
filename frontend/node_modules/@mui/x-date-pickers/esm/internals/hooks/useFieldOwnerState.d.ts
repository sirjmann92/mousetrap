import { FieldOwnerState } from "../../models/index.js";
import { FormProps } from "../models/index.js";
export declare function useFieldOwnerState(parameters: UseFieldOwnerStateParameters): FieldOwnerState;
export interface UseFieldOwnerStateParameters extends FormProps {
  required?: boolean;
}
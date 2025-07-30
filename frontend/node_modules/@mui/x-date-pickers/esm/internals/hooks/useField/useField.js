import { useFieldV7TextField } from "./useFieldV7TextField.js";
import { useFieldV6TextField } from "./useFieldV6TextField.js";
import { useNullableFieldPrivateContext } from "../useNullableFieldPrivateContext.js";
export const useField = parameters => {
  const fieldPrivateContext = useNullableFieldPrivateContext();
  const enableAccessibleFieldDOMStructure = parameters.props.enableAccessibleFieldDOMStructure ?? fieldPrivateContext?.enableAccessibleFieldDOMStructure ?? true;
  const useFieldTextField = enableAccessibleFieldDOMStructure ? useFieldV7TextField : useFieldV6TextField;
  return useFieldTextField(parameters);
};
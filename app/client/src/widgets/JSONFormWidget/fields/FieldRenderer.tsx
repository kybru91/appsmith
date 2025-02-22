import React, { useContext, useEffect, useRef } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import FormContext from "../FormContext";
import type { SchemaItem } from "../constants";
import { FIELD_MAP } from "../constants";
import useUnmountFieldValidation from "./useUnmountFieldValidation";

interface FieldRendererProps {
  fieldName: ControllerRenderProps["name"];
  // TODO: Fix this the next time the file is edited
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>;
  passedDefaultValue?: unknown;
  propertyPath: string;
  schemaItem: SchemaItem;
}

function FieldRenderer({
  fieldName,
  options,
  passedDefaultValue,
  propertyPath,
  schemaItem,
}: FieldRendererProps) {
  const firstRender = useRef(true);
  const { fieldType, isVisible = true } = schemaItem;
  const { getValues } = useFormContext();
  const { updateFormData } = useContext(FormContext);

  const FieldComponent = FIELD_MAP[fieldType];

  useUnmountFieldValidation({ fieldName });
  useEffect(() => {
    /**
     * When a component is hidden, the field is removed from the form and the component unmounts.
     * So formData update is triggered so that the particular field can be removed from the `formData`.
     *
     * Alternative solution: enable `shouldUnregister` in useController which will
     * de-register in the RHF's internal formData state. There's a caveat which needs to be
     * solved before this is enabled i.e the ArrayField does not play well with this configuration.
     * Removing of one Array field item will reset all the items below it.
     */
    if (firstRender.current === true) {
      firstRender.current = false;
    } else {
      const values = getValues();

      updateFormData(values);
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  if (!FieldComponent) return null;

  return (
    <FieldComponent
      fieldClassName={fieldName.replace(/[\.\[\]]/gi, "-")} // replace [,],. with -
      name={fieldName}
      passedDefaultValue={passedDefaultValue}
      propertyPath={propertyPath}
      schemaItem={schemaItem}
      {...options}
    />
  );
}

export default FieldRenderer;

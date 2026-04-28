import type { IOptions } from "./renderFormComponents/SelectComponent";

export type FieldType = "text" | "textarea" | "select" | "date" | "multiselect" | "other";

export interface BaseField {
  name: string;
  label: string;
  type: FieldType;
  className?: string;
}

export interface TextField extends BaseField {
  type: "text";
  inputType?: string;
}

export interface TextareaField extends BaseField {
  type: "textarea";
}

export interface SelectField extends BaseField {
  type: "select";
  placeholder: string;
  options: IOptions[];
  disabled?: boolean;
}

export interface DateField extends BaseField {
  type: "date";
}

export interface OtherField extends BaseField {
    type: "other";
}

export interface MultiSelectField {
  name: string;
  label: string;
  type: "multiselect";
  placeholder?: string;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  inputType?: string;
}


export type FormField = TextField | TextareaField | SelectField | DateField | OtherField | MultiSelectField;
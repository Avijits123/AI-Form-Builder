import type { UseFormRegisterReturn } from 'react-hook-form';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: string;
  max?: string;
}

export type FieldType = 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'fileUpload';

export interface FormField {
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: ValidationRules;
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface BaseFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  required?: boolean;
  options?: string[];
}

export interface PromptRequest {
  prompt: string;
}

export interface PromptResponse {
  schema: FormSchema;
}

export interface GeneratedSchema extends FormSchema {
  generatedAt?: string;
}


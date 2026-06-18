import { z } from 'zod';
import type { FormSchema } from '../types/form.types';

export function generateZodSchema(schema: FormSchema): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};

  if (!schema || !Array.isArray(schema.fields)) {
    return z.object({});
  }

  schema.fields.forEach((field) => {
    if (!field.name) return;

    let fieldSchema: z.ZodTypeAny;
    const isRequired = field.required || field.validation?.required;

    // 1. Base schema and requirement checks per field type
    if (field.type === 'checkbox') {
      if (isRequired) {
        fieldSchema = z.boolean().refine(
          (val) => val === true,
          { message: `${field.label || field.name} is required` }
        );
      } else {
        fieldSchema = z.boolean().optional();
      }
    } else if (field.type === 'fileUpload') {
      if (isRequired) {
        fieldSchema = z.any().refine(
          (files) => {
            if (!files) return false;
            if (typeof window !== 'undefined' && files instanceof FileList) return files.length > 0;
            if (Array.isArray(files)) return files.length > 0;
            if (typeof files === 'string') return files.length > 0;
            return true;
          },
          { message: `${field.label || field.name} is required` }
        );
      } else {
        fieldSchema = z.any().optional();
      }
    } else if (field.type === 'number') {
      if (isRequired) {
        fieldSchema = z.string()
          .min(1, { message: `${field.label || field.name} is required` })
          .refine(
            (val) => !isNaN(Number(val)),
            { message: 'Must be a valid number' }
          );
      } else {
        fieldSchema = z.string()
          .optional()
          .or(z.literal(''))
          .refine(
            (val) => !val || !isNaN(Number(val)),
            { message: 'Must be a valid number' }
          );
      }
    } else {
      let stringSchema = z.string();
      if (field.type === 'email') {
        stringSchema = stringSchema.email({ message: 'Invalid email address' });
      }

      if (isRequired) {
        fieldSchema = stringSchema.min(1, {
          message: `${field.label || field.name} is required`,
        });
      } else {
        fieldSchema = stringSchema.optional().or(z.literal(''));
      }
    }

    // 3. Apply validation rules from validation block
    if (field.validation) {
      const { minLength, maxLength, min, max } = field.validation;

      if (minLength !== undefined && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.min(minLength, {
          message: `${field.label || field.name} must be at least ${minLength} characters`,
        });
      }

      if (maxLength !== undefined && fieldSchema instanceof z.ZodString) {
        fieldSchema = fieldSchema.max(maxLength, {
          message: `${field.label || field.name} must be at most ${maxLength} characters`,
        });
      }

      if (field.type === 'date') {
        if (min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodString).refine(
            (val) => {
              if (!val) return true; // Let required rule handle empty check
              return new Date(val) >= new Date(min);
            },
            { message: `${field.label || field.name} must be on or after ${min}` }
          );
        }

        if (max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodString).refine(
            (val) => {
              if (!val) return true;
              return new Date(val) <= new Date(max);
            },
            { message: `${field.label || field.name} must be on or before ${max}` }
          );
        }
      }
    }

    shape[field.name] = fieldSchema;
  });

  return z.object(shape);
}

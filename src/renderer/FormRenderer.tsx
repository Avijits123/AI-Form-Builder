import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormSchema, BaseFieldProps } from '../types/form.types';
import { generateZodSchema } from '../utils/validation';
import Button from '../components/Button';
import styles from './FormRenderer.module.css';

// Component registry
import TextField from '../components/fields/TextField';
import EmailField from '../components/fields/EmailField';
import PhoneField from '../components/fields/PhoneField';
import NumberField from '../components/fields/NumberField';
import DateField from '../components/fields/DateField';
import TextareaField from '../components/fields/TextareaField';
import SelectField from '../components/fields/SelectField';
import RadioField from '../components/fields/RadioField';
import CheckboxField from '../components/fields/CheckboxField';
import FileUploadField from '../components/fields/FileUploadField';

const componentRegistry: Record<string, React.FC<BaseFieldProps>> = {
  text: TextField,
  email: EmailField,
  phone: PhoneField,
  number: NumberField,
  date: DateField,
  textarea: TextareaField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  fileUpload: FileUploadField,
};

interface FormRendererProps {
  schema: FormSchema;
  onSubmit: (data: Record<string, unknown>) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ schema, onSubmit }) => {
  // Generate Zod validation schema dynamically from the current form schema
  const zodSchema = useMemo(() => generateZodSchema(schema), [schema]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FieldValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(zodSchema as any),
    mode: 'onTouched',
  });

  // Automatically reset/reinitialize values when the schema configuration changes
  useEffect(() => {
    reset({});
  }, [schema, reset]);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as Record<string, unknown>))} className={styles.formContainer}>
      <div className={styles.fieldsGrid}>
        {schema.fields.map((field) => {
          if (!field.name) return null;

          const FieldComponent = componentRegistry[field.type];
          if (!FieldComponent) {
            return (
              <div key={field.name} className={styles.unsupportedField}>
                Unsupported field type: "{field.type}" for field "{field.name}"
              </div>
            );
          }

          const fieldRegister = register(field.name);
          const errorMsg = errors[field.name]?.message as string | undefined;

          return (
            <FieldComponent
              key={field.name}
              label={field.label || field.name}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required || field.validation?.required}
              options={field.options}
              register={fieldRegister}
              error={errorMsg}
            />
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button type="submit" isLoading={isSubmitting} className={styles.submitBtn}>
          Submit Data
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => reset({})}
          className={styles.resetBtn}
        >
          Reset Fields
        </Button>
      </div>
    </form>
  );
};

export default FormRenderer;

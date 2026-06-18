import type { FormSchema } from '../types/form.types';

function toPascalCase(str: string): string {
  const clean = str.replace(/[^a-zA-Z0-9\s-_]/g, '');
  const words = clean.split(/[\s-_]+/);
  const capitalized = words.map(w => w.charAt(0).toUpperCase() + w.slice(1));
  let result = capitalized.join('');
  if (/^[0-9]/.test(result)) {
    result = 'Form' + result;
  }
  return result || 'GeneratedForm';
}

function toValidFieldName(str: string): string {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str)) {
    return str;
  }
  const clean = str.replace(/[^a-zA-Z0-9_$]/g, ' ');
  const words = clean.trim().split(/\s+/);
  if (words.length === 0 || !words[0]) return 'field';
  const first = words[0].toLowerCase();
  const rest = words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  let result = first + rest.join('');
  if (/^[0-9]/.test(result)) {
    result = '_' + result;
  }
  return result;
}

function getFieldTsType(type: string): string {
  switch (type) {
    case 'checkbox':
      return 'boolean';
    case 'number':
      return 'number';
    case 'fileUpload':
      return 'any';
    default:
      return 'string';
  }
}

export function generateReactCode(schema: FormSchema): string {
  const componentName = toPascalCase(schema.title || 'MyForm');
  const valuesInterfaceName = `${componentName}Values`;

  // Map fields to validated identifiers
  const fields = (schema.fields || []).map(field => ({
    ...field,
    cleanName: toValidFieldName(field.name),
  }));

  // Construct TypeScript interface fields
  const interfaceFields = fields
    .map(field => `  ${field.cleanName}: ${getFieldTsType(field.type)};`)
    .join('\n');

  // Render individual fields
  const fieldsHtml = fields.map(field => {
    const isRequired = field.required || field.validation?.required;
    const validationRules: string[] = [];

    if (isRequired) {
      if (field.type === 'checkbox') {
        validationRules.push(`required: '${field.label || field.name} is required'`);
        validationRules.push(`validate: (val) => val === true || '${field.label || field.name} is required'`);
      } else {
        validationRules.push(`required: '${field.label || field.name} is required'`);
      }
    }

    if (field.validation) {
      const { minLength, maxLength, min, max, pattern } = field.validation;
      if (minLength !== undefined) {
        validationRules.push(`minLength: { value: ${minLength}, message: '${field.label || field.name} must be at least ${minLength} characters' }`);
      }
      if (maxLength !== undefined) {
        validationRules.push(`maxLength: { value: ${maxLength}, message: '${field.label || field.name} must be at most ${maxLength} characters' }`);
      }
      if (min !== undefined) {
        if (field.type === 'number') {
          validationRules.push(`min: { value: ${min}, message: '${field.label || field.name} must be at least ${min}' }`);
        } else {
          validationRules.push(`min: { value: '${min}', message: '${field.label || field.name} must be on or after ${min}' }`);
        }
      }
      if (max !== undefined) {
        if (field.type === 'number') {
          validationRules.push(`max: { value: ${max}, message: '${field.label || field.name} must be at most ${max}' }`);
        } else {
          validationRules.push(`max: { value: '${max}', message: '${field.label || field.name} must be on or before ${max}' }`);
        }
      }
      if (pattern !== undefined) {
        validationRules.push(`pattern: { value: /${pattern}/, message: 'Invalid format' }`);
      }
    }

    if (field.type === 'email' && !field.validation?.pattern) {
      validationRules.push(`pattern: { value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, message: 'Invalid email address' }`);
    }

    if (field.type === 'number') {
      validationRules.push('valueAsNumber: true');
    }

    const rulesStr = validationRules.length > 0 ? `{ ${validationRules.join(', ')} }` : '{}';
    const errorCondition = `errors.${field.cleanName}`;
    const errorMessageStr = `errors.${field.cleanName}?.message`;

    switch (field.type) {
      case 'textarea':
        return `        {/* Textarea Field */}
        <div className="field-group">
          <label htmlFor="${field.cleanName}" className="field-label">
            ${field.label || field.name}
            ${isRequired ? `<span className="required-star">*</span>` : ''}
          </label>
          <textarea
            id="${field.cleanName}"
            placeholder="${field.placeholder || ''}"
            className={\`input-textarea \${${errorCondition} ? 'input-error' : ''}\`}
            {...register('${field.cleanName}', ${rulesStr})}
          />
          {${errorCondition} && (
            <span className="error-message">{${errorMessageStr}}</span>
          )}
        </div>`;

      case 'select': {
        const optionsMarkup = (field.options || [])
          .map(opt => `            <option value="${opt}">${opt}</option>`)
          .join('\n');
        return `        {/* Select Field */}
        <div className="field-group">
          <label htmlFor="${field.cleanName}" className="field-label">
            ${field.label || field.name}
            ${isRequired ? `<span className="required-star">*</span>` : ''}
          </label>
          <select
            id="${field.cleanName}"
            className={\`input-select \${${errorCondition} ? 'input-error' : ''}\`}
            {...register('${field.cleanName}', ${rulesStr})}
          >
            <option value="">${field.placeholder || 'Select an option...'}</option>
${optionsMarkup}
          </select>
          {${errorCondition} && (
            <span className="error-message">{${errorMessageStr}}</span>
          )}
        </div>`;
      }

      case 'radio': {
        const radioOptionsMarkup = (field.options || [])
          .map(opt => `            <label className="radio-option">
              <input
                type="radio"
                value="${opt}"
                className="radio-input"
                {...register('${field.cleanName}', ${rulesStr})}
              />
              ${opt}
            </label>`)
          .join('\n');
        return `        {/* Radio Field */}
        <div className="field-group">
          <span className="field-label">
            ${field.label || field.name}
            ${isRequired ? `<span className="required-star">*</span>` : ''}
          </span>
          <div className="radio-group">
${radioOptionsMarkup}
          </div>
          {${errorCondition} && (
            <span className="error-message">{${errorMessageStr}}</span>
          )}
        </div>`;
      }

      case 'checkbox':
        return `        {/* Checkbox Field */}
        <div className="field-group">
          <div className="checkbox-group">
            <label className="checkbox-option">
              <input
                id="${field.cleanName}"
                type="checkbox"
                className="checkbox-input"
                {...register('${field.cleanName}', ${rulesStr})}
              />
              <span>
                ${field.label || field.name}
                ${isRequired ? `<span className="required-star">*</span>` : ''}
              </span>
            </label>
          </div>
          {${errorCondition} && (
            <span className="error-message">{${errorMessageStr}}</span>
          )}
        </div>`;

      case 'fileUpload':
        return `        {/* File Upload Field */}
        <div className="field-group">
          <label htmlFor="${field.cleanName}" className="field-label">
            ${field.label || field.name}
            ${isRequired ? `<span className="required-star">*</span>` : ''}
          </label>
          <input
            id="${field.cleanName}"
            type="file"
            className={\`input-text \${${errorCondition} ? 'input-error' : ''}\`}
            {...register('${field.cleanName}', ${rulesStr})}
          />
          {${errorCondition} && (
            <span className="error-message">{${errorMessageStr}}</span>
          )}
        </div>`;

      default: {
        // text, email, phone, number, date
        let inputType = 'text';
        if (field.type === 'email') inputType = 'email';
        if (field.type === 'phone') inputType = 'tel';
        if (field.type === 'number') inputType = 'number';
        if (field.type === 'date') inputType = 'date';

        return `        {/* ${field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field */}
        <div className="field-group">
          <label htmlFor="${field.cleanName}" className="field-label">
            ${field.label || field.name}
            ${isRequired ? `<span className="required-star">*</span>` : ''}
          </label>
          <input
            id="${field.cleanName}"
            type="${inputType}"
            placeholder="${field.placeholder || ''}"
            className={\`input-text \${${errorCondition} ? 'input-error' : ''}\`}
            {...register('${field.cleanName}', ${rulesStr})}
          />
          {${errorCondition} && (
            <span className="error-message">{${errorMessageStr}}</span>
          )}
        </div>`;
      }
    }
  }).join('\n\n');

  // Self-contained style block for standard React projects
  const stylingCss = `
  .form-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
    font-family: system-ui, -apple-system, sans-serif;
  }
  .form-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin-top: 0;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }
  .form-description {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 1.5rem;
  }
  .field-group {
    margin-bottom: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .field-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #334155;
  }
  .required-star {
    color: #ef4444;
    margin-left: 0.125rem;
  }
  .input-text, .input-select, .input-textarea {
    width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    outline: none;
    background: #ffffff;
    color: #0f172a;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .input-text:focus, .input-select:focus, .input-textarea:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }
  .input-error {
    border-color: #ef4444 !important;
  }
  .error-message {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.25rem;
  }
  .radio-group, .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
  .radio-option, .checkbox-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #334155;
  }
  .radio-input, .checkbox-input {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    margin: 0;
  }
  .checkbox-option {
    align-items: flex-start;
  }
  .checkbox-option input {
    margin-top: 0.2rem;
  }
  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  .btn-submit {
    background: #2563eb;
    color: #ffffff;
    font-weight: 600;
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.15s ease;
  }
  .btn-submit:hover {
    background: #1d4ed8;
  }
  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .btn-reset {
    background: #64748b;
    color: #ffffff;
    font-weight: 600;
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.15s ease;
  }
  .btn-reset:hover {
    background: #475569;
  }
  .success-banner {
    background-color: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }
  .payload-viewer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
  }
  .payload-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
  }
  .payload-code {
    background: #0f172a;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    overflow: auto;
    max-height: 200px;
    margin: 0;
  }
`;

  return `import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export interface ${valuesInterfaceName} {
${interfaceFields}
}

export default function ${componentName}() {
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<${valuesInterfaceName} | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<${valuesInterfaceName}>({
    mode: 'onTouched',
  });

  const onSubmit = (data: ${valuesInterfaceName}) => {
    console.log('Form Submitted Data:', data);
    setSubmittedData(data);
    setIsSubmitSuccess(true);
  };

  const handleReset = () => {
    reset();
    setIsSubmitSuccess(false);
    setSubmittedData(null);
  };

  return (
    <div className="form-container">
      <style>{\`${stylingCss}\`}</style>

      {isSubmitSuccess && (
        <div className="success-banner">
          ✓ Form submitted successfully!
        </div>
      )}

      <h2 className="form-title">${schema.title || 'Generated Form'}</h2>
      ${schema.description ? `<p className="form-description">${schema.description}</p>` : ''}

      <form onSubmit={handleSubmit(onSubmit)}>
${fieldsHtml}

        <div className="button-group">
          <button type="submit" disabled={isSubmitting} className="btn-submit">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={handleReset} className="btn-reset">
            Reset
          </button>
        </div>
      </form>

      {submittedData && (
        <div className="payload-viewer">
          <h3 className="payload-title">Submitted Payload:</h3>
          <pre className="payload-code">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
`;
}

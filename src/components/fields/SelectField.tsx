import React from 'react';
import type { BaseFieldProps } from '../../types/form.types';
import styles from './fields.module.css';

export const SelectField: React.FC<BaseFieldProps> = ({
  label,
  name,
  placeholder = 'Select an option...',
  register,
  error,
  required,
  options = [],
}) => {
  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.requiredStar}>*</span>}
      </label>
      <select
        id={name}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...register}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default SelectField;

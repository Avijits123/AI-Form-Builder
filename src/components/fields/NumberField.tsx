import React from 'react';
import type { BaseFieldProps } from '../../types/form.types';
import styles from './fields.module.css';

export const NumberField: React.FC<BaseFieldProps> = ({
  label,
  name,
  placeholder,
  register,
  error,
  required,
}) => {
  return (
    <div className={styles.fieldContainer}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.requiredStar}>*</span>}
      </label>
      <input
        type="number"
        id={name}
        placeholder={placeholder || 'Enter a number'}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...register}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default NumberField;

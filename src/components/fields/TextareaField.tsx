import React from 'react';
import type { BaseFieldProps } from '../../types/form.types';
import styles from './fields.module.css';

export const TextareaField: React.FC<BaseFieldProps> = ({
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
      <textarea
        id={name}
        placeholder={placeholder}
        className={`${styles.textarea} ${error ? styles.inputError : ''}`}
        {...register}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default TextareaField;

import React from 'react';
import type { BaseFieldProps } from '../../types/form.types';
import styles from './fields.module.css';

export const CheckboxField: React.FC<BaseFieldProps> = ({
  label,
  name,
  register,
  error,
  required,
}) => {
  return (
    <div className={styles.fieldContainer}>
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          id={name}
          className={styles.checkboxInput}
          {...register}
        />
        <label htmlFor={name} className={styles.checkboxLabel}>
          {label}
          {required && <span className={styles.requiredStar}>*</span>}
        </label>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default CheckboxField;

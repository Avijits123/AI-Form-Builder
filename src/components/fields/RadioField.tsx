import React from 'react';
import type { BaseFieldProps } from '../../types/form.types';
import styles from './fields.module.css';

export const RadioField: React.FC<BaseFieldProps> = ({
  label,
  name,
  register,
  error,
  required,
  options = [],
}) => {
  return (
    <div className={styles.fieldContainer}>
      <span className={styles.label}>
        {label}
        {required && <span className={styles.requiredStar}>*</span>}
      </span>
      <div className={styles.radioGroup}>
        {options.map((opt) => {
          const id = `${name}-${opt.replace(/\s+/g, '-').toLowerCase()}`;
          return (
            <label key={opt} htmlFor={id} className={styles.radioOption}>
              <input
                type="radio"
                id={id}
                value={opt}
                className={styles.radioInput}
                {...register}
              />
              <span className={styles.radioLabel}>{opt}</span>
            </label>
          );
        })}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default RadioField;

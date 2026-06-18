import React from 'react';
import type { BaseFieldProps } from '../../types/form.types';
import styles from './fields.module.css';

export const FileUploadField: React.FC<BaseFieldProps> = ({
  label,
  name,
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
      <div className={styles.fileInputWrapper}>
        <input
          type="file"
          id={name}
          className={`${styles.fileInput} ${error ? styles.inputError : ''}`}
          {...register}
        />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default FileUploadField;

import type { ReactNode } from 'react';
import styles from './FormField.module.css';

/** Accessibility attributes FormField hands to its control. */
export interface FormControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  /** Shows a character counter when both values are provided. */
  currentLength?: number;
  maxLength?: number;
  children: (controlProps: FormControlProps) => ReactNode;
}

/** Label, control, error message and optional character counter, wired together for screen readers. */
export function FormField({ id, label, error, currentLength, maxLength, children }: FormFieldProps) {
  const errorId = `${id}-error`;
  const counterId = `${id}-counter`;
  const showCounter = currentLength !== undefined && maxLength !== undefined;
  const describedBy = [error && errorId, showCounter && counterId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {(error || showCounter) && (
        <div className={styles.footer}>
          {error ? (
            <p id={errorId} className={styles.error}>
              {error}
            </p>
          ) : (
            <span />
          )}
          {showCounter && (
            <span id={counterId} className={currentLength > maxLength ? styles.counterExceeded : styles.counter}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

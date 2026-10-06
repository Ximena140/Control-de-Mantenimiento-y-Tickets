import type { ReactNode } from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  variant: 'error' | 'success' | 'info';
  message: string;
  /** Optional control rendered next to the message, e.g. a retry button. */
  action?: ReactNode;
  onClose?: () => void;
}

export function Alert({ variant, message, action, onClose }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role={variant === 'error' ? 'alert' : 'status'}>
      <p className={styles.message}>{message}</p>
      {action}
      {onClose && (
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  );
}

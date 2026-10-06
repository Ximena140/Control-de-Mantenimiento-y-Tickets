import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'medium' | 'small';
  fullWidth?: boolean;
  isLoading?: boolean;
  /** Text shown while `isLoading` is true. */
  loadingText?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  loadingText,
  type = 'button',
  disabled,
  className,
  children,
  ...buttonProps
}: ButtonProps) {
  const classNames = [styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button {...buttonProps} type={type} className={classNames} disabled={disabled || isLoading} aria-busy={isLoading || undefined}>
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}

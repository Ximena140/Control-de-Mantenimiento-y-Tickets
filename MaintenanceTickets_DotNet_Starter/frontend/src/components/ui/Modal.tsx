import { useEffect, useId, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  size?: 'medium' | 'large';
  children: ReactNode;
}

/**
 * Native <dialog> modal: the browser handles focus trapping, the backdrop and the Escape key.
 * On open, focus moves to the first form control so the user can type right away.
 */
export function Modal({ isOpen, title, onClose, size = 'medium', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (isOpen && !dialog.open) {
      dialog.showModal();
      bodyRef.current?.querySelector<HTMLElement>('input, textarea, select')?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles[size]}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // React state decides whether the dialog stays open.
        event.preventDefault();
        onClose();
      }}
    >
      {isOpen && (
        <>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
              ×
            </button>
          </header>
          <div ref={bodyRef} className={styles.body}>
            {children}
          </div>
        </>
      )}
    </dialog>
  );
}

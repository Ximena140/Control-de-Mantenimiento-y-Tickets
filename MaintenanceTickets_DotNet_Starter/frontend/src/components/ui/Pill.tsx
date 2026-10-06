import type { ReactNode } from 'react';
import styles from './Pill.module.css';

export type PillTone = 'warning' | 'info' | 'success' | 'danger' | 'neutral';

interface PillProps {
  tone: PillTone;
  children: ReactNode;
}

/** Small rounded label, used for column titles, asset codes, statuses and priorities. */
export function Pill({ tone, children }: PillProps) {
  return <span className={`${styles.pill} ${styles[tone]}`}>{children}</span>;
}

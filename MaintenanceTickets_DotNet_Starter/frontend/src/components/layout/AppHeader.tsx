import styles from './AppHeader.module.css';

/** Top bar with the brand and section name. The operator label is static: the API has no authentication. */
export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-label="Fractal">
          FR<span className={styles.logoAccent}>A</span>CT<span className={styles.logoAccent}>A</span>L
        </span>
        <span className={styles.divider} aria-hidden="true" />
        <h1 className={styles.section}>Mantenimiento · Tickets</h1>
      </div>
      <div className={styles.operator}>
        <span>Operador</span>
        <span className={styles.avatar} aria-hidden="true">
          OP
        </span>
      </div>
    </header>
  );
}

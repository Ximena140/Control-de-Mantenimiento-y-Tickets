export type ApiErrorKind = 'http' | 'network' | 'configuration';

/** Validation messages keyed by request field name (camelCase). */
export type FieldErrors = Record<string, string>;

/** Normalized error thrown by httpClient for every failed API call. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status code; null when no response was received. */
  readonly status: number | null;
  readonly fieldErrors: FieldErrors;

  constructor(kind: ApiErrorKind, status: number | null, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

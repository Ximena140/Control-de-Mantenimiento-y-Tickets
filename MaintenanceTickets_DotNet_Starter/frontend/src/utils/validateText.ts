interface TextRules {
  /** Subject used in length messages, e.g. "El título". */
  fieldName: string;
  requiredMessage: string;
  minLength?: number;
  maxLength?: number;
}

/**
 * Validates a required text field. Whitespace-only values count as empty, like in the backend.
 * Returns the error message, or undefined when the value is valid.
 */
export function validateRequiredText(value: string, { fieldName, requiredMessage, minLength, maxLength }: TextRules): string | undefined {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return requiredMessage;
  }
  if (minLength !== undefined && trimmedValue.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres.`;
  }
  if (maxLength !== undefined && value.length > maxLength) {
    return `${fieldName} no puede superar ${maxLength} caracteres.`;
  }
  return undefined;
}

/** Drops fields without an error message so the result only lists invalid fields. */
export function removeEmptyErrors<TErrors extends Record<string, string | undefined>>(errors: TErrors): Partial<TErrors> {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message !== undefined)) as Partial<TErrors>;
}

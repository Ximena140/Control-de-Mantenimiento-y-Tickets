import { useState, type FormEvent } from 'react';
import type { FieldErrors } from '../services/apiError';

export type FormErrors<TValues> = Partial<Record<keyof TValues, string>>;

interface UseFormOptions<TValues> {
  initialValues: TValues;
  validate: (values: TValues) => FormErrors<TValues>;
  onSubmit: (values: TValues) => Promise<void>;
}

/**
 * Controlled form state with client-side validation.
 * Fields are validated on submit and, after the first submit attempt, on every change.
 * Inputs must use the field key as their `name` so the first invalid field can be focused.
 */
export function useForm<TValues extends object>({ initialValues, validate, onSubmit }: UseFormOptions<TValues>) {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<TValues>>({});
  const [hasSubmitAttempt, setHasSubmitAttempt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setFieldValue<TField extends keyof TValues>(field: TField, value: TValues[TField]) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    if (hasSubmitAttempt) {
      setErrors(validate(nextValues));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const validationErrors = validate(values);
    setHasSubmitAttempt(true);
    setErrors(validationErrors);

    const firstInvalidField = Object.keys(validationErrors)[0];
    if (firstInvalidField) {
      form.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  /** Shows API validation errors on the fields they belong to; unknown fields are ignored. */
  function setServerErrors(fieldErrors: FieldErrors) {
    const knownFieldErrors: FormErrors<TValues> = {};
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field in values) {
        knownFieldErrors[field as keyof TValues] = message;
      }
    }
    setErrors(knownFieldErrors);
  }

  function reset() {
    setValues(initialValues);
    setErrors({});
    setHasSubmitAttempt(false);
  }

  return { values, errors, isSubmitting, setFieldValue, handleSubmit, setServerErrors, reset };
}

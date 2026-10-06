import { useId } from 'react';
import { FormField } from './FormField';
import fieldStyles from './FormField.module.css';

interface TextAreaProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  /** Shows a character counter; the limit itself is enforced by the form validation. */
  maxLength?: number;
  placeholder?: string;
  rows?: number;
}

export function TextArea({ name, label, value, onChange, error, required, maxLength, placeholder, rows = 3 }: TextAreaProps) {
  const id = useId();

  return (
    <FormField id={id} label={label} error={error} currentLength={value.length} maxLength={maxLength}>
      {(controlProps) => (
        <textarea
          {...controlProps}
          className={fieldStyles.control}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          rows={rows}
        />
      )}
    </FormField>
  );
}

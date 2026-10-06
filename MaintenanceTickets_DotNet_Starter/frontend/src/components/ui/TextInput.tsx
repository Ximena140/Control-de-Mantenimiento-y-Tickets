import { useId } from 'react';
import { FormField } from './FormField';
import fieldStyles from './FormField.module.css';

interface TextInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  /** Shows a character counter; the limit itself is enforced by the form validation. */
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
}

export function TextInput({ name, label, value, onChange, error, required, maxLength, placeholder, autoComplete = 'off' }: TextInputProps) {
  const id = useId();

  return (
    <FormField id={id} label={label} error={error} currentLength={value.length} maxLength={maxLength}>
      {(controlProps) => (
        <input
          {...controlProps}
          className={fieldStyles.control}
          type="text"
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      )}
    </FormField>
  );
}

import { useId } from 'react';
import { FormField } from './FormField';
import fieldStyles from './FormField.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  name: string;
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  /** Label of the empty option shown while nothing is selected. */
  placeholder: string;
  error?: string;
  required?: boolean;
}

export function SelectInput({ name, label, value, options, onChange, placeholder, error, required }: SelectInputProps) {
  const id = useId();

  return (
    <FormField id={id} label={label} error={error}>
      {(controlProps) => (
        <select
          {...controlProps}
          className={fieldStyles.control}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}

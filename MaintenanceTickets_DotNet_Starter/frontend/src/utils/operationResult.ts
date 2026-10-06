import { ApiError, type FieldErrors } from '../services/apiError';
import { getErrorMessage } from './getErrorMessage';

/** Error details a component needs to display a failed operation. */
export interface OperationFailure {
  status: number | null;
  message: string;
  fieldErrors: FieldErrors;
}

export type OperationResult<TData> = { ok: true; data: TData } | { ok: false; error: OperationFailure };

export function toOperationFailure(error: unknown): OperationFailure {
  return {
    status: error instanceof ApiError ? error.status : null,
    message: getErrorMessage(error),
    fieldErrors: error instanceof ApiError ? error.fieldErrors : {},
  };
}

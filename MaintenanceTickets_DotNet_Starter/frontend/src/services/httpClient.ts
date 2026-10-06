import { API_BASE_URL } from '../config/apiConfig';
import { ApiError, type FieldErrors } from './apiError';

type HttpMethod = 'GET' | 'POST' | 'PUT';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Sends a JSON request to the API and returns the parsed response body.
 * Any 2xx status is a success; everything else is thrown as an ApiError.
 * Aborted requests rethrow the original AbortError so callers can ignore them.
 */
export async function request<TResponse>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new ApiError('configuration', null, 'VITE_API_BASE_URL is not configured.');
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    throw new ApiError('network', null, 'The API could not be reached.');
  }

  const payload = await readResponseBody(response);
  if (!response.ok) {
    throw toApiError(response.status, payload);
  }
  return payload as TResponse;
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * The API returns two error shapes:
 * - ProblemDetails `{ title, errors: { Field: [messages] } }` for model validation (400);
 * - `{ message }` for business rules (400 on create, 409 on status change).
 */
function toApiError(status: number, payload: unknown): ApiError {
  if (!isRecord(payload)) {
    return new ApiError('http', status, '');
  }
  const message = typeof payload.message === 'string' ? payload.message : typeof payload.title === 'string' ? payload.title : '';
  const fieldErrors = isRecord(payload.errors) ? normalizeFieldErrors(payload.errors) : {};
  return new ApiError('http', status, message, fieldErrors);
}

/** Converts ProblemDetails keys (`Title`, `$.priority`) to request field names (`title`, `priority`). */
function normalizeFieldErrors(errors: Record<string, unknown>): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const [key, messages] of Object.entries(errors)) {
    const fieldName = key.replace(/^\$\./, '');
    const camelCaseName = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
    const firstMessage = Array.isArray(messages) ? messages.find((item) => typeof item === 'string') : undefined;
    if (firstMessage) {
      fieldErrors[camelCaseName] = firstMessage;
    }
  }
  return fieldErrors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

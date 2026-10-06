import { ApiError } from '../services/apiError';

/** Translates any error raised by the API layer into a message for the user. */
export function getErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  }

  if (error.kind === 'configuration') {
    return 'La aplicación no tiene configurada la dirección del servidor (VITE_API_BASE_URL).';
  }
  if (error.kind === 'network' || error.status === null) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.';
  }

  const { status } = error;
  if (status === 400) {
    return Object.keys(error.fieldErrors).length > 0
      ? 'Algunos datos no son válidos. Revisa los campos marcados.'
      : withServerDetail('Los datos enviados no son válidos', error.message);
  }
  if (status === 404) {
    return 'El ticket no existe o ya no está disponible.';
  }
  if (status === 409) {
    return withServerDetail('El servidor rechazó la operación', error.message);
  }
  if (status >= 500) {
    return 'Ocurrió un error en el servidor. Intenta nuevamente.';
  }
  return `Ocurrió un error inesperado (código ${status}).`;
}

function withServerDetail(summary: string, serverMessage: string): string {
  return serverMessage ? `${summary}: ${serverMessage}` : `${summary}.`;
}

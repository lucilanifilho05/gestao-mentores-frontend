interface BackendErrorBody {
  message?: string | string[];
  error?: string;
  errors?: Record<string, string | string[]>;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Confira os dados informados e tente novamente.',
  401: 'Sua sessão está ausente ou expirou.',
  403: 'Você não possui permissão para realizar esta ação.',
  404: 'O registro solicitado não foi encontrado.',
  409: 'A operação conflita com uma regra do sistema.',
  413: 'O arquivo selecionado é maior que o permitido.',
  500: 'Ocorreu um erro interno. Tente novamente em instantes.',
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;
  readonly body: unknown;

  constructor(
    message: string,
    status: number,
    body: unknown,
    fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.fieldErrors = fieldErrors;
  }
}

function isBackendErrorBody(value: unknown): value is BackendErrorBody {
  return typeof value === 'object' && value !== null;
}

function normalizeFieldErrors(body: unknown): Record<string, string[]> {
  if (!isBackendErrorBody(body) || !body.errors) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(body.errors).map(([field, value]) => [
      field,
      Array.isArray(value) ? value : [value],
    ]),
  );
}

function extractBackendMessage(body: unknown): string | null {
  if (!isBackendErrorBody(body)) {
    return null;
  }

  if (Array.isArray(body.message)) {
    return body.message.filter(Boolean).join(' ');
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }

  if (typeof body.error === 'string' && body.error.trim()) {
    return body.error;
  }

  return null;
}

export function createApiError(status: number, body: unknown): ApiError {
  const message =
    extractBackendMessage(body) ??
    STATUS_MESSAGES[status] ??
    'Não foi possível concluir a operação.';

  return new ApiError(message, status, body, normalizeFieldErrors(body));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Não foi possível concluir a operação.';
}

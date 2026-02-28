export class AppError extends Error {
  code: string;
  details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const toError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError('unknown', error.message, error);
  }

  return new AppError('unknown', 'Unexpected error', error);
};

export const getErrorMessage = (error: unknown) => toError(error).message;

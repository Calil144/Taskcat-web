export type ApiErrorCode = "HTTP_ERROR" | "NETWORK_ERROR" | "INVALID_RESPONSE";

import { mockApiRequest } from "./mockApi";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(
    message: string,
    code: ApiErrorCode,
    status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

function errorMessageFromBody(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null) return fallback;

  const details = body as {
    message?: unknown;
    detail?: unknown;
    error?: unknown;
  };
  const message = details.message ?? details.detail ?? details.error;
  return typeof message === "string" && message.trim() ? message : fallback;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function requestApi<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallbackMessage: string,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch (cause) {
    if (import.meta.env.DEV && import.meta.env.VITE_API_MOCKS === "true") {
      const mockResponse = await mockApiRequest(input, init);
      if (mockResponse) response = mockResponse;
      else {
        throw new ApiError(
          "O endpoint não possui um mock configurado. Verifique o backend ou adicione um mock para esta rota.",
          "NETWORK_ERROR",
          undefined,
          { cause },
        );
      }
    } else {
      throw new ApiError(
        "Não foi possível conectar ao servidor. Verifique se o backend está disponível.",
        "NETWORK_ERROR",
        undefined,
        { cause },
      );
    }
  }

  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_API_MOCKS === "true" &&
    (response.status === 404 || response.status === 501)
  ) {
    const mockResponse = await mockApiRequest(input, init);
    if (mockResponse) response = mockResponse;
  }

  let body: unknown;
  try {
    body = await parseBody(response);
  } catch (cause) {
    throw new ApiError(
      "Não foi possível ler a resposta do servidor.",
      "INVALID_RESPONSE",
      response.status,
      { cause },
    );
  }

  if (!response.ok) {
    throw new ApiError(
      errorMessageFromBody(body, fallbackMessage),
      "HTTP_ERROR",
      response.status,
    );
  }

  if (typeof body === "string") {
    throw new ApiError(
      "O servidor retornou uma resposta em formato inválido.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  return body as T;
}

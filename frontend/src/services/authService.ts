import type { AuthSession } from "../contexts/AuthContext";

interface LoginResponse extends AuthSession {
  tokenType: string;
  expiresIn: number;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthSession> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível entrar."));
  }

  const result = (await response.json()) as LoginResponse;
  return {
    id: result.id,
    username: result.username,
    email: result.email,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
}

export async function readApiError(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = (await response.json()) as {
      message?: string;
      detail?: string;
      error?: string;
    };
    return body.message ?? body.detail ?? body.error ?? fallback;
  } catch {
    return fallback;
  }
}

import type { AuthSession } from "../contexts/AuthContext";
import { requestApi } from "./apiClient";

interface LoginResponse extends AuthSession {
  tokenType: string;
  expiresIn: number;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthSession> {
  const result = await requestApi<LoginResponse>(
    "/api/v1/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    },
    "Não foi possível entrar.",
  );

  return {
    id: result.id,
    username: result.username,
    email: result.email,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
}

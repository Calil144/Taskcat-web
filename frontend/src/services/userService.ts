import { requestApi } from "./apiClient";

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

interface CreatedUser {
  id?: string;
}

export function createUser(user: CreateUserRequest) {
  return requestApi<CreatedUser | null | undefined>(
    "/api/v1/users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    },
    "Não foi possível cadastrar o usuário.",
  );
}

interface UpdateUserRequest {
  username: string;
  email: string;
}

interface UpdateUserResponse {
  id: string;
}

export function updateUser(
  userId: string,
  user: UpdateUserRequest,
  accessToken: string,
): Promise<UpdateUserResponse> {
  return requestApi<UpdateUserResponse>(
    `/api/v1/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(user),
    },
    "Não foi possível atualizar o usuário.",
  );
}

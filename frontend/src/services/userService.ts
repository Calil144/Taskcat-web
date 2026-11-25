interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export async function createUser(user: CreateUserRequest) {
  const response = await fetch(`/api/v1/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`Erro ao cadastrar usuário: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

import { readApiError } from "./authService";

interface UpdateUserRequest {
  username: string;
  email: string;
}

interface UpdateUserResponse {
  id: string;
}

export async function updateUser(
  userId: string,
  user: UpdateUserRequest,
  accessToken: string,
): Promise<UpdateUserResponse> {
  const response = await fetch(`/api/v1/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível atualizar o usuário."),
    );
  }

  return response.json();
}

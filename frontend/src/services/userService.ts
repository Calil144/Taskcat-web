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
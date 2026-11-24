import type { Project, ArchivedProject } from "../types/project";

export async function getProjects(userId: string): Promise<Project[]> {
  const response = await fetch("/api/v1/projects?page=0&size=100", {
    method: "GET",
    headers: {
      "X-User-Id": userId,
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar projetos: ${response.status}`);
  }

  return response.json();
}

export async function getArchivedProjects(
  userId: string
): Promise<ArchivedProject[]> {
  const params = new URLSearchParams({
    userId,
    page: "0",
    size: "100",
  });

  const response = await fetch(
    `/api/v1/projects/archived?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "X-User-Id": userId,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar projetos arquivados: ${response.status}`
    );
  }

  return response.json();
}
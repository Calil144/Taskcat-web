import type {
  ArchivedProject,
  Project,
  ProjectDetails,
  ProjectMember,
} from "../types/project";
import { requestApi } from "./apiClient";

const PROJECTS_URL = "/api/v1/projects";

function authorizationHeaders(token: string, json = false): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

export function getProjects(token: string): Promise<Project[]> {
  return requestApi<Project[]>(
    `${PROJECTS_URL}?page=0&size=100`,
    { headers: authorizationHeaders(token) },
    "Não foi possível carregar os projetos.",
  );
}

export function getArchivedProjects(token: string): Promise<ArchivedProject[]> {
  return requestApi<ArchivedProject[]>(
    `${PROJECTS_URL}/archived?page=0&size=100`,
    { headers: authorizationHeaders(token) },
    "Não foi possível carregar os projetos arquivados.",
  );
}

export async function createProject(token: string, name: string): Promise<string> {
  const result = await requestApi<{ id: string }>(
    PROJECTS_URL,
    {
      method: "POST",
      headers: authorizationHeaders(token, true),
      body: JSON.stringify({ name }),
    },
    "Não foi possível criar o projeto.",
  );
  return result.id;
}

export function updateProject(
  token: string,
  projectId: string,
  name: string,
): Promise<void> {
  return requestApi<void>(
    `${PROJECTS_URL}/${projectId}`,
    {
      method: "PUT",
      headers: authorizationHeaders(token, true),
      body: JSON.stringify({ name }),
    },
    "Não foi possível editar o projeto.",
  );
}

export function getProjectDetails(
  token: string,
  projectId: string,
): Promise<ProjectDetails> {
  return requestApi<ProjectDetails>(
    `${PROJECTS_URL}/${projectId}`,
    { headers: authorizationHeaders(token) },
    "Não foi possível carregar os detalhes do projeto.",
  );
}

export function archiveProject(token: string, projectId: string): Promise<void> {
  return requestApi<void>(
    `${PROJECTS_URL}/${projectId}/archive`,
    { method: "PATCH", headers: authorizationHeaders(token) },
    "Não foi possível arquivar o projeto.",
  );
}

export function restoreProject(token: string, projectId: string): Promise<void> {
  return requestApi<void>(
    `${PROJECTS_URL}/${projectId}/restore`,
    { method: "PATCH", headers: authorizationHeaders(token) },
    "Não foi possível restaurar o projeto.",
  );
}

export function deleteProject(token: string, projectId: string): Promise<void> {
  return requestApi<void>(
    `${PROJECTS_URL}/${projectId}`,
    { method: "DELETE", headers: authorizationHeaders(token) },
    "Não foi possível excluir o projeto.",
  );
}

export function getProjectMembers(
  token: string,
  projectId: string,
): Promise<ProjectMember[]> {
  return requestApi<ProjectMember[]>(
    `${PROJECTS_URL}/${projectId}/members?page=0&size=100`,
    { headers: authorizationHeaders(token) },
    "Não foi possível carregar os membros do projeto.",
  );
}

export function addProjectMember(
  token: string,
  projectId: string,
  userId: string,
  role: ProjectMember["role"],
): Promise<void> {
  return requestApi<void>(
    `${PROJECTS_URL}/${projectId}/members`,
    {
      method: "POST",
      headers: authorizationHeaders(token, true),
      body: JSON.stringify({ userId, role }),
    },
    "Não foi possível adicionar o membro.",
  );
}

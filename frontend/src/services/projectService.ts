import { readApiError } from "./authService";
import type {
  ArchivedProject,
  Project,
  ProjectDetails,
  ProjectMember,
} from "../types/project";

const PROJECTS_URL = "/api/v1/projects";

function authorizationHeaders(token: string, json = false): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

async function ensureSuccess(response: Response, fallback: string) {
  if (!response.ok) {
    throw new Error(await readApiError(response, fallback));
  }
}

export async function getProjects(token: string): Promise<Project[]> {
  const response = await fetch(`${PROJECTS_URL}?page=0&size=100`, {
    headers: authorizationHeaders(token),
  });
  await ensureSuccess(response, "Não foi possível carregar os projetos.");
  return response.json();
}

export async function getArchivedProjects(
  token: string
): Promise<ArchivedProject[]> {
  const response = await fetch(`${PROJECTS_URL}/archived?page=0&size=100`, {
    headers: authorizationHeaders(token),
  });
  await ensureSuccess(response, "Não foi possível carregar os projetos arquivados.");
  return response.json();
}

export async function createProject(token: string, name: string): Promise<string> {
  const response = await fetch(PROJECTS_URL, {
    method: "POST",
    headers: authorizationHeaders(token, true),
    body: JSON.stringify({ name }),
  });
  await ensureSuccess(response, "Não foi possível criar o projeto.");
  const result = (await response.json()) as { id: string };
  return result.id;
}

export async function updateProject(
  token: string,
  projectId: string,
  name: string
): Promise<void> {
  const response = await fetch(`${PROJECTS_URL}/${projectId}`, {
    method: "PUT",
    headers: authorizationHeaders(token, true),
    body: JSON.stringify({ name }),
  });
  await ensureSuccess(response, "Não foi possível editar o projeto.");
}

export async function getProjectDetails(
  token: string,
  projectId: string
): Promise<ProjectDetails> {
  const response = await fetch(`${PROJECTS_URL}/${projectId}`, {
    headers: authorizationHeaders(token),
  });
  await ensureSuccess(response, "Não foi possível carregar os detalhes do projeto.");
  return response.json();
}

export async function archiveProject(
  token: string,
  projectId: string
): Promise<void> {
  const response = await fetch(`${PROJECTS_URL}/${projectId}/archive`, {
    method: "PATCH",
    headers: authorizationHeaders(token),
  });
  await ensureSuccess(response, "Não foi possível arquivar o projeto.");
}

export async function getProjectMembers(
  token: string,
  projectId: string
): Promise<ProjectMember[]> {
  const response = await fetch(`${PROJECTS_URL}/${projectId}/members?page=0&size=100`, {
    headers: authorizationHeaders(token),
  });
  await ensureSuccess(response, "Não foi possível carregar os membros do projeto.");
  return response.json();
}

export async function addProjectMember(
  token: string,
  projectId: string,
  userId: string,
  role: ProjectMember["role"]
): Promise<void> {
  const response = await fetch(`${PROJECTS_URL}/${projectId}/members`, {
    method: "POST",
    headers: authorizationHeaders(token, true),
    body: JSON.stringify({ userId, role }),
  });
  await ensureSuccess(response, "Não foi possível adicionar o membro.");
}

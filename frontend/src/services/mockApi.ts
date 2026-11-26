import type { AuthSession } from "../contexts/AuthContext";
import type {
  ArchivedProject,
  Project,
  ProjectDetails,
  ProjectMember,
} from "../types/project";

interface MockUser extends AuthSession {
  password: string;
}

const DEMO_USER: MockUser = {
  id: "mock-user-001",
  username: "Usuário de demonstração",
  email: "demo@taskcat.local",
  password: "taskcat123",
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
};

const users: MockUser[] = [DEMO_USER];
const projects: Project[] = [
  {
    id: "mock-project-001",
    name: "Projeto de demonstração",
    ownerId: DEMO_USER.id,
    createdAt: "2026-01-01T12:00:00.000Z",
  },
];
const archivedProjects: ArchivedProject[] = [];
const archivedProjectDetails = new Map<string, Project>();
const projectMembers = new Map<string, ProjectMember[]>([
  ["mock-project-001", [{
    userId: DEMO_USER.id,
    username: DEMO_USER.username,
    email: DEMO_USER.email,
    role: "OWNER",
    joinedAt: "2026-01-01T12:00:00.000Z",
  }]],
]);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseRequestBody<T>(init: RequestInit): T {
  return JSON.parse(String(init.body ?? "{}")) as T;
}

export async function mockApiRequest(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response | null> {
  const url = new URL(String(input), "http://localhost");
  const path = url.pathname;
  const method = (init.method ?? "GET").toUpperCase();

  if (path === "/api/v1/auth/login" && method === "POST") {
    const credentials = parseRequestBody<{ email: string; password: string }>(init);
    const user = users.find(
      (entry) => entry.email === credentials.email && entry.password === credentials.password,
    );
    if (!user) return jsonResponse({ message: "E-mail ou senha inválidos no modo mock." }, 401);
    return jsonResponse({
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      tokenType: "Bearer",
      expiresIn: 3600,
    });
  }

  if (path === "/api/v1/users" && method === "POST") {
    const data = parseRequestBody<{ username: string; email: string; password: string }>(init);
    if (users.some((user) => user.email === data.email)) {
      return jsonResponse({ message: "Este e-mail já está cadastrado no modo mock." }, 409);
    }
    const user: MockUser = {
      ...data,
      id: `mock-user-${Date.now()}`,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };
    users.push(user);
    return jsonResponse({ id: user.id }, 201);
  }

  const userMatch = path.match(/^\/api\/v1\/users\/([^/]+)$/);
  if (userMatch && method === "PATCH") {
    const user = users.find((entry) => entry.id === userMatch[1]);
    if (!user) return jsonResponse({ message: "Usuário mock não encontrado." }, 404);
    Object.assign(user, parseRequestBody<{ username: string; email: string }>(init));
    return jsonResponse({ id: user.id });
  }

  if (path === "/api/v1/projects" && method === "GET") {
    return jsonResponse(projects);
  }

  if (path === "/api/v1/projects/archived" && method === "GET") {
    return jsonResponse(archivedProjects);
  }

  const restoreMatch = path.match(/^\/api\/v1\/projects\/([^/]+)\/restore$/);
  if (restoreMatch && method === "PATCH") {
    const projectId = restoreMatch[1];
    const archivedIndex = archivedProjects.findIndex((entry) => entry.id === projectId);
    if (archivedIndex < 0) {
      return jsonResponse({ message: "Projeto mock arquivado não encontrado." }, 404);
    }

    const [archivedProject] = archivedProjects.splice(archivedIndex, 1);
    const project = archivedProjectDetails.get(projectId);
    if (project) projects.push(project);
    archivedProjectDetails.delete(projectId);
    return jsonResponse({ id: archivedProject.id });
  }

  if (path === "/api/v1/projects" && method === "POST") {
    const { name } = parseRequestBody<{ name: string }>(init);
    const project: Project = {
      id: `mock-project-${Date.now()}`,
      name,
      ownerId: DEMO_USER.id,
      createdAt: new Date().toISOString(),
    };
    projects.push(project);
    projectMembers.set(project.id, []);
    return jsonResponse({ id: project.id }, 201);
  }

  const memberMatch = path.match(/^\/api\/v1\/projects\/([^/]+)\/members$/);
  if (memberMatch) {
    const projectId = memberMatch[1];
    if (!projects.some((project) => project.id === projectId)) {
      return jsonResponse({ message: "Projeto mock não encontrado." }, 404);
    }
    if (method === "GET") return jsonResponse(projectMembers.get(projectId) ?? []);
    if (method === "POST") {
      const data = parseRequestBody<{ userId: string; role: ProjectMember["role"] }>(init);
      const user = users.find((entry) => entry.id === data.userId);
      if (!user) return jsonResponse({ message: "Usuário mock não encontrado." }, 404);
      const members = projectMembers.get(projectId) ?? [];
      members.push({
        userId: user.id,
        username: user.username,
        email: user.email,
        role: data.role,
        joinedAt: new Date().toISOString(),
      });
      projectMembers.set(projectId, members);
      return jsonResponse(undefined, 204);
    }
  }

  const projectMatch = path.match(/^\/api\/v1\/projects\/([^/]+)(\/archive)?$/);
  if (projectMatch) {
    const projectId = projectMatch[1];
    const projectIndex = projects.findIndex((entry) => entry.id === projectId);
    if (projectMatch[2] && method === "PATCH") {
      if (projectIndex < 0) return jsonResponse({ message: "Projeto mock não encontrado." }, 404);
      const [project] = projects.splice(projectIndex, 1);
      archivedProjectDetails.set(project.id, project);
      archivedProjects.push({ ...project, archivedAt: new Date().toISOString() });
      return jsonResponse(undefined, 204);
    }
    if (projectIndex < 0) return jsonResponse({ message: "Projeto mock não encontrado." }, 404);
    if (method === "GET") {
      const project = projects[projectIndex];
      const details: ProjectDetails = {
        projectId: project.id,
        name: project.name,
        ownerId: project.ownerId,
        role: "OWNER",
        createdAt: project.createdAt,
        archivedAt: null,
      };
      return jsonResponse(details);
    }
    if (method === "PUT") {
      const { name } = parseRequestBody<{ name: string }>(init);
      projects[projectIndex] = { ...projects[projectIndex], name };
      return jsonResponse(undefined, 204);
    }
  }

  return null;
}

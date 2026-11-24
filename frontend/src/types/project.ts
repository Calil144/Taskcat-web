export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface ProjectDetails {
  projectId: string;
  name: string;
  ownerId: string;
  role: ProjectRole;
  createdAt: string;
  archivedAt: string | null;
}

export interface ArchivedProject {
  id: string;
  name: string;
  archivedAt: string;
}

export type ProjectRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface ProjectMember {
  userId: string;
  username: string;
  email: string;
  role: ProjectRole;
  joinedAt: string;
}

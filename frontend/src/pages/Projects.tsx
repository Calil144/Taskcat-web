import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  addProjectMember,
  archiveProject,
  createProject,
  getArchivedProjects,
  getProjectDetails,
  getProjectMembers,
  getProjects,
  restoreProject,
  updateProject,
} from "../services/projectService";
import type {
  ArchivedProject,
  Project,
  ProjectDetails,
  ProjectMember,
  ProjectRole,
} from "../types/project";
import "../styles/Projects.css";

const memberRoles: ProjectRole[] = ["ADMIN", "MEMBER", "VIEWER"];

export default function Projects() {
  const { session } = useAuth();
  const token = session?.accessToken ?? "";
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [archiveConfirmationId, setArchiveConfirmationId] = useState("");
  const [restoreConfirmationId, setRestoreConfirmationId] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState<ProjectRole>("MEMBER");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadProjects = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const [active, archived] = await Promise.all([
        getProjects(token),
        getArchivedProjects(token),
      ]);
      setProjects(active);
      setArchivedProjects(archived);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os projetos."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!token || !selectedProjectId) {
      setDetailsLoading(false);
      setProjectDetails(null);
      setMembers([]);
      return;
    }

    let cancelled = false;
    setProjectDetails(null);
    setMembers([]);
    setDetailsLoading(true);
    Promise.all([
      getProjectDetails(token, selectedProjectId),
      getProjectMembers(token, selectedProjectId),
    ])
      .then(([details, projectMembers]) => {
        if (!cancelled) {
          setProjectDetails(details);
          setMembers(projectMembers);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os detalhes e membros do projeto."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, selectedProjectId]);

  function startCreating() {
    setEditingProjectId(null);
    setProjectName("");
    setError("");
    setNotice("");
  }

  function startEditing(project: Project) {
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setError("");
    setNotice("");
  }

  async function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = projectName.trim();

    if (!name) {
      setError("Informe o nome do projeto.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (editingProjectId) {
        await updateProject(token, editingProjectId, name);
        setNotice("Projeto atualizado com sucesso.");
      } else {
        const projectId = await createProject(token, name);
        setNotice("Projeto criado. Você foi definido como OWNER.");
        setSelectedProjectId(projectId);
      }
      setEditingProjectId(null);
      setProjectName("");
      await loadProjects();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o projeto."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = memberUserId.trim();

    if (!selectedProjectId || !userId) {
      setError("Informe o UUID da pessoa que deseja adicionar.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await addProjectMember(token, selectedProjectId, userId, memberRole);
      setMemberUserId("");
      setNotice("Membro adicionado com sucesso.");
      setMembers(await getProjectMembers(token, selectedProjectId));
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível adicionar o membro."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleArchiveProject(project: Project) {
    try {
      setSaving(true);
      setError("");
      await archiveProject(token, project.id);
      setNotice(`Projeto "${project.name}" arquivado com sucesso.`);
      setArchiveConfirmationId("");
      setSelectedProjectId((current) => current === project.id ? "" : current);
      if (editingProjectId === project.id) {
        setEditingProjectId(null);
        setProjectName("");
      }
      await loadProjects();
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : "Não foi possível arquivar o projeto."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRestoreProject(project: ArchivedProject) {
    try {
      setSaving(true);
      setError("");
      await restoreProject(token, project.id);
      setRestoreConfirmationId("");
      setNotice(`Projeto "${project.name}" restaurado com sucesso.`);
      await loadProjects();
    } catch (restoreError) {
      setError(
        restoreError instanceof Error
          ? restoreError.message
          : "Não foi possível restaurar o projeto."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="projects-page">
      <header className="projects-heading">
        <div>
          <h1>Projetos</h1>
          <p>Crie projetos, atualize seus nomes e gerencie os membros.</p>
        </div>
        <button type="button" onClick={startCreating}>
          Novo projeto
        </button>
      </header>

      {error && <p className="projects-message projects-error" role="alert">{error}</p>}
      {notice && <p className="projects-message projects-success" role="status">{notice}</p>}

      <section className="project-editor" aria-labelledby="project-editor-title">
        <h2 id="project-editor-title">
          {editingProjectId ? "Editar projeto" : "Criar projeto"}
        </h2>
        <form onSubmit={handleProjectSubmit}>
          <label htmlFor="project-name">Nome do projeto</label>
          <input
            id="project-name"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            minLength={3}
            maxLength={100}
            required
          />
          <div className="project-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Salvando..." : editingProjectId ? "Salvar edição" : "Criar projeto"}
            </button>
            {editingProjectId && (
              <button type="button" className="secondary-button" onClick={startCreating}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="project-list-section" aria-labelledby="project-list-title">
        <h2 id="project-list-title">Projetos ativos</h2>
        {loading ? (
          <p>Carregando projetos...</p>
        ) : projects.length === 0 ? (
          <p>Você ainda não possui projetos.</p>
        ) : (
          <ul className="project-list">
            {projects.map((project) => (
              <li className="project-list-item" key={project.id}>
                <div>
                  <h3>{project.name}</h3>
                  <p>
                    Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                    {project.ownerId === session?.id ? " · Você é OWNER" : ""}
                  </p>
                </div>
                <div className="project-item-actions">
                  <button type="button" onClick={() => startEditing(project)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    aria-expanded={selectedProjectId === project.id}
                    onClick={() => {
                      setError("");
                      setSelectedProjectId((current) =>
                        current === project.id ? "" : project.id
                      );
                    }}
                  >
                    {selectedProjectId === project.id ? "Fechar detalhes" : "Detalhes e membros"}
                  </button>
                  <button
                    type="button"
                    className="archive-button"
                    onClick={() => {
                      setError("");
                      setArchiveConfirmationId(project.id);
                    }}
                  >
                    Arquivar
                  </button>
                </div>
                {archiveConfirmationId === project.id && (
                  <div className="archive-confirmation" role="group" aria-label={`Confirmar arquivamento de ${project.name}`}>
                    <p>Arquivar “{project.name}”? O projeto deixará a lista de ativos.</p>
                    <button
                      type="button"
                      className="archive-button"
                      disabled={saving}
                      onClick={() => void handleArchiveProject(project)}
                    >
                      {saving ? "Arquivando..." : "Confirmar arquivamento"}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={saving}
                      onClick={() => setArchiveConfirmationId("")}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="project-list-section" aria-labelledby="archived-project-list-title">
        <h2 id="archived-project-list-title">Projetos arquivados</h2>
        {loading ? (
          <p>Carregando projetos arquivados...</p>
        ) : archivedProjects.length === 0 ? (
          <p>Você não possui projetos arquivados.</p>
        ) : (
          <ul className="project-list">
            {archivedProjects.map((project) => (
              <li className="project-list-item" key={project.id}>
                <div>
                  <h3>{project.name}</h3>
                  <p>
                    Arquivado em {new Date(project.archivedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {restoreConfirmationId === project.id ? (
                  <div className="restore-confirmation" role="group" aria-label={`Confirmar restauração de ${project.name}`}>
                    <p>Restaurar “{project.name}” e seus quadros e tarefas?</p>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleRestoreProject(project)}
                    >
                      {saving ? "Restaurando..." : "Confirmar restauração"}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={saving}
                      onClick={() => setRestoreConfirmationId("")}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setNotice("");
                      setRestoreConfirmationId(project.id);
                    }}
                  >
                    Restaurar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedProjectId && (
        <section className="project-members" aria-labelledby="project-details-title">
          <h2 id="project-details-title">Detalhes do projeto</h2>
          {detailsLoading ? (
            <p>Carregando detalhes...</p>
          ) : projectDetails ? (
            <dl className="project-details-list">
              <div><dt>Nome</dt><dd>{projectDetails.name}</dd></div>
              <div><dt>ID</dt><dd>{projectDetails.projectId}</dd></div>
              <div><dt>OWNER (UUID)</dt><dd>{projectDetails.ownerId}</dd></div>
              <div><dt>Seu papel</dt><dd>{projectDetails.role}</dd></div>
              <div><dt>Criado em</dt><dd>{new Date(projectDetails.createdAt).toLocaleString("pt-BR")}</dd></div>
            </dl>
          ) : null}

          <h3 id="members-title">Membros</h3>
          {detailsLoading ? null : members.length === 0 ? (
            <p>Nenhum membro encontrado.</p>
          ) : (
            <ul>
              {members.map((member) => (
                <li key={member.userId}>
                  <span>{member.username} ({member.email})</span>
                  <strong>{member.role}</strong>
                </li>
              ))}
            </ul>
          )}

          {projectDetails && (projectDetails.role === "OWNER" || projectDetails.role === "ADMIN") && (
          <form onSubmit={handleAddMember}>
            <h3>Adicionar membro</h3>
            <label htmlFor="member-user-id">UUID do usuário</label>
            <input
              id="member-user-id"
              value={memberUserId}
              onChange={(event) => setMemberUserId(event.target.value)}
              placeholder="Ex.: 123e4567-e89b-12d3-a456-426614174000"
              required
            />
            <label htmlFor="member-role">Papel no projeto</label>
            <select
              id="member-role"
              value={memberRole}
              onChange={(event) => setMemberRole(event.target.value as ProjectRole)}
            >
              {memberRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <button type="submit" disabled={saving}>Adicionar membro</button>
          </form>
          )}
        </section>
      )}
    </main>
  );
}

import { useEffect, useState } from "react";
import type { Project, ArchivedProject } from "../types/project";
import { getProjects, getArchivedProjects } from "../services/projectService";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Dashboard.css";
export default function Dashboard() {
    const { session } = useAuth();
    const token = session?.accessToken ?? "";

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);

    
    useEffect(() => {
    async function carregarProjetos() {
        if (!token) {
            setLoading(false);
            setError("Sessão expirada. Entre novamente.");
            return;
        }
        try {
        setLoading(true);
        setError("");

        const [data, archivedData] = await Promise.all([
            getProjects(token),
            getArchivedProjects(token),
        ])

        setProjects(data);
        setArchivedProjects(archivedData);

        } catch (error) {
        console.error(error);
        setError(
            error instanceof Error
                ? error.message
                : "Não foi possível carregar os projetos."
        );
        } finally {
        setLoading(false);
        }
    }

  carregarProjetos();
    }, [token]);

    const activeCount = projects.length;
    const archivedCount = archivedProjects.length;
    const totalCount = activeCount + archivedCount;


  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard-subtitle">
        Visão geral dos seus projetos
      </p>

      <section className="dashboard-summary">
        <div className="summary-card">
          <h3>Total de projetos</h3>
          <p>{loading || error ? "-" : totalCount}</p>
        </div>

        <div className="summary-card">
          <h3>Projetos ativos</h3>
          <p>{loading || error ? "-" : activeCount}</p>
        </div>

        <div className="summary-card">
          <h3>Projetos arquivados</h3>
          <p>{loading || error ? "-" : archivedCount}</p>
        </div>
      </section>

      <section className="projects-section">
        <h2>Meus projetos</h2>

        
        <div className="projects-list">
        {loading ? (
            <p>Carregando projetos...</p>
        ) : error ? (
            <p role="alert">{error}</p>
        ) : projects.length === 0 ? (
            <p>Você ainda não possui projetos.</p>
        ) : (
            projects.map((project) => (
            <div className="project-card" key={project.id}>
                <h3>{project.name}</h3>
                <p>
                Criado em:{" "}
                {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                </p>
            </div>
            ))
        )}
        </div>

      </section>
    </div>
  );
}

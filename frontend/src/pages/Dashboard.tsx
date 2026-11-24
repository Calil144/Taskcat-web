import { useEffect, useState } from "react";
import type { Project, ArchivedProject } from "../types/project";
import { getProjects, getArchivedProjects } from "../services/projectService";
import "../styles/Dashboard.css";
export default function Dashboard() {

const userId = "b5d53996-f0ea-4832-a1ee-a59b0da6d49e";

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);

    
    useEffect(() => {
    async function carregarProjetos() {
        try {
        setLoading(true);
        setError("");

        const [data, archivedData] = await Promise.all([
            getProjects(userId),
            getArchivedProjects(userId),
        ])

        setProjects(data);
        setArchivedProjects(archivedData);

        } catch (error) {
        console.error(error);
        setError("Não foi possível carregar os projetos.");
        } finally {
        setLoading(false);
        }
    }

  carregarProjetos();
}, [userId]);

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

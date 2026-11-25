import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../services/userService";
import "../styles/Profile.css";

export default function Profile() {
  const { session, updateSession } = useAuth();

  const [username, setUsername] = useState(session?.username ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!session) {
      setError("Não foi possível identificar o usuário.");
      return;
    }

    if (!username.trim() || !email.trim()) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      await updateUser(
        session.id,
        {
          username: username.trim(),
          email: email.trim(),
        },
        session.accessToken,
      );

      updateSession({
        username: username.trim(),
        email: email.trim(),
      });

      setMessage("Perfil atualizado com sucesso!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return <p>Você precisa estar autenticado para visualizar seu perfil.</p>;
  }

  return (
    <main className="profile">
      <h1>Meu Perfil</h1>
      <p className="profile-subtitle">
        Visualize e atualize suas informações pessoais.
      </p>

      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{username}</h2>
            <p>{email}</p>
          </div>
        </div>

        <div className="profile-divider" />

        <h3>Informações pessoais</h3>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-field">
            <label htmlFor="username">Nome de usuário</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {message && (
            <p className="profile-success" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="profile-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </section>
    </main>
  );
}

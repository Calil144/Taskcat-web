import { useState } from "react";
import  "../styles/Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");

  if (!email.trim() || !password.trim()) {
    setError("Preencha todos os campos.");
    return;
  }

  if (!email.includes("@")) {
    setError("Digite um e-mail válido.");
    return;
  }

  login();
  navigate("/dashboard", { replace: true });
}

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit">Entrar</button>
        <p>
            Não possui uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>

      </form>
    </div>
  );
}
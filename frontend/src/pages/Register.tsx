import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Auth.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Preencha todos os campos.");
      return;
    }

    if (!email.includes("@")) {
      setError("Digite um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    console.log("Cadastro validado:", {
      username,
      email,
    });
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h1>Cadastro</h1>

        <label htmlFor="username">Nome de usuário</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <label htmlFor="register-email">E-mail</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="register-password">Senha</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <label htmlFor="confirm-password">Confirmar senha</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit">Cadastrar</button>

        <p>
          Já possui uma conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
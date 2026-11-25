import { createContext, useContext, useState, type ReactNode } from "react";

export interface AuthSession {
  id: string;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  session: AuthSession | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  updateSession: (data: Pick<AuthSession, "username" | "email">) => void;
}

const SESSION_KEY = "taskcat-session";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  const storedSession = sessionStorage.getItem(SESSION_KEY);

  if (!storedSession) return null;

  try {
    const session = JSON.parse(storedSession) as AuthSession;
    return session.accessToken && session.id ? session : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readStoredSession);

  function login(newSession: AuthSession) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  function updateSession(data: Pick<AuthSession, "username" | "email">) {
    setSession((currentSession) => {
      if (!currentSession) return null;

      const updatedSession = {
        ...currentSession,
        ...data,
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));

      return updatedSession;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(session),
        session,
        login,
        logout,
        updateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}

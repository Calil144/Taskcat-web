import {createContext,useContext,useState,type ReactNode} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("isAuthenticated") === "true";
  });

  function login() {
    sessionStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  }

  function logout() {
    sessionStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout }}
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

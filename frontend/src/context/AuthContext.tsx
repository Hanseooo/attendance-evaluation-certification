import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, RegisterPayload } from "../utils/types";
import { Loader2 } from "lucide-react"; // ShadCN icon

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loadingUser: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "authToken";

// Loading screen component
export const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <Loader2 className="h-10 w-10 animate-spin text-white" />
  </div>
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [loadingUser, setLoadingUser] = useState(true);

  // Derive authentication directly from user
  const isAuthenticated = !!user;

  // Helper: fetch current user
  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/user/", {
        headers: { Authorization: `Token ${authToken}` },
      });

      if (!res.ok) {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
      } else {
        const data = await res.json();
        setUser(data);
      }
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoadingUser(false);
    }
  };

  // Restore user on app load if token exists
  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoadingUser(false);
    }
  }, [token]);

  // Login
  const login = async (usernameOrEmail: string, password: string) => {
    const payload = usernameOrEmail.includes("@")
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password };

    const res = await fetch("http://127.0.0.1:8000/dj-rest-auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.non_field_errors?.[0] || "Login failed");
    }

    const data = await res.json();
    const tokenValue = data.key;

    // Save token and fetch user
    localStorage.setItem(TOKEN_KEY, tokenValue);
    setToken(tokenValue);
    await fetchUser(tokenValue);
  };

  // Logout
  const logout = async () => {
    if (token) {
      try {
        await fetch("http://127.0.0.1:8000/dj-rest-auth/logout/", {
          method: "POST",
          headers: { Authorization: `Token ${token}` },
        });
      } catch {
        // ignore errors
      }
    }

    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  // Register
  const register = async (payload: RegisterPayload) => {
    const res = await fetch("http://127.0.0.1:8000/dj-rest-auth/registration/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(
        err?.email?.[0] || err?.username?.[0] || err?.password1?.[0] || "Registration failed"
      );
    }

    // Auto-login after registration
    await login(payload.username, payload.password1);
  };

  if (loadingUser) return <LoadingScreen />;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loadingUser, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

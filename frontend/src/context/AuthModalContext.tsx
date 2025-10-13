import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthModalContextType {
  isOpen: boolean;
  isLogin: boolean;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  toggleMode: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const openLogin = () => {
    setIsLogin(true);
    setIsOpen(true);
  };

  const openRegister = () => {
    setIsLogin(false);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const toggleMode = () => setIsLogin(prev => !prev);

  return (
    <AuthModalContext.Provider value={{ isOpen, isLogin, openLogin, openRegister, closeModal, toggleMode }}>
      {children}
    </AuthModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
};
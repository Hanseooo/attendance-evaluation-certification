import { useId, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthModal } from "@/context/AuthModalContext";
import { useAuth } from "@/context/AuthContext";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import { useNavigate } from "react-router-dom";

const checkPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 0) return { level: "", color: "" };
  if (score <= 2) return { level: "Weak", color: "text-red-500" };
  if (score === 3) return { level: "Medium", color: "text-yellow-500" };
  return { level: "Strong", color: "text-green-500" };
};

export default function AuthModal() {
  const { isOpen, isLogin, closeModal, toggleMode } = useAuthModal();
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    level: "",
    color: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { redirectTo, setRedirectTo } = useAuth();

  const ids = {
    firstName: useId(),
    lastName: useId(),
    username: useId(),
    email: useId(),
    password: useId(),
    confirmPassword: useId(),
  };

  useEffect(() => {
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors(null);
    setPasswordStrength({ level: "", color: "" });
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "firstName" || id === "lastName") {
      newValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData((prev) => ({ ...prev, [id]: newValue }));

    if (!isLogin && id === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const { firstName, lastName, username, email, password, confirmPassword } =
      formData;

    if (isLogin) {
      if (!username && !email) return "Enter username or email.";
      if (!password) return "Enter password.";
      if (password.length < 8) return "Password must be at least 8 characters.";
    } else {
      const nameRegex = /^[A-Za-z]+$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !firstName ||
        !lastName ||
        !username ||
        !email ||
        !password ||
        !confirmPassword
      )
        return "All fields are required.";
      if (!nameRegex.test(firstName) || !nameRegex.test(lastName))
        return "Names should only contain letters.";
      if (firstName.length < 2 || lastName.length < 2)
        return "Names must be at least 2 characters.";
      if (!emailRegex.test(email)) return "Invalid email format.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    const validationError = validateForm();
    if (validationError) return setErrors(validationError);

    setLoading(true);
    try {
      if (isLogin) {
        const { username, email, password } = formData;
        await login(username || email, password);
      } else {
        await register({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          password1: formData.password,
          password2: formData.confirmPassword,
        });
      }
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        setRedirectTo(null);
      } else {
        closeModal();
      }
    } catch (err: any) {
      // ✅ Handle API error responses properly
      if (err.response?.data) {
        const apiErrors = err.response.data;

        // Handle different error formats from Django
        if (typeof apiErrors === "string") {
          setErrors(apiErrors);
        } else if (apiErrors.non_field_errors) {
          setErrors(apiErrors.non_field_errors[0]);
        } else if (apiErrors.username) {
          setErrors(`Username: ${apiErrors.username[0]}`);
        } else if (apiErrors.email) {
          setErrors(`Email: ${apiErrors.email[0]}`);
        } else if (apiErrors.password1) {
          setErrors(`Password: ${apiErrors.password1[0]}`);
        } else if (apiErrors.detail) {
          setErrors(apiErrors.detail);
        } else {
          // Try to extract first error message
          const firstError = Object.values(apiErrors)[0];
          if (Array.isArray(firstError)) {
            setErrors(firstError[0]);
          } else {
            setErrors(String(firstError));
          }
        }
      } else if (err.message) {
        setErrors(err.message);
      } else {
        setErrors("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md mx-auto px-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="relative bg-background border shadow-xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeModal}
                    className="text-muted-foreground hover:bg-muted/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <CardHeader className="pt-8 pb-4 px-6">
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                      {isLogin ? "Login" : "Register"}
                    </CardTitle>
                    <CardDescription>
                      {isLogin
                        ? "Welcome back! Please log in to continue."
                        : "Create your account to get started."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={ids.firstName}>First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="John"
                              className="capitalize"
                            />
                          </div>
                          <div>
                            <Label htmlFor={ids.lastName}>Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Doe"
                              className="capitalize"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={ids.username}>Username</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="johndoe"
                          />
                        </div>

                        <div>
                          <Label htmlFor={ids.email}>Email</Label>
                          <Input
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                          />
                        </div>
                      </>
                    )}

                    {isLogin && (
                      <div>
                        <Label htmlFor={ids.username}>Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Enter username"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5 relative">
                      <Label htmlFor={ids.password}>Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="********"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {!isLogin && formData.password && (
                        <p className={`text-sm mt-1 ${passwordStrength.color}`}>
                          Password strength: {passwordStrength.level}
                        </p>
                      )}
                    </div>

                    {!isLogin && (
                      <div className="space-y-1.5 relative">
                        <Label htmlFor={ids.confirmPassword}>
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="********"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {isLogin && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm px-0 h-auto text-primary"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
                    )}

                    {errors && (
                      <p className="text-red-500 text-sm mt-2 text-center">
                        {errors}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 p-6 border-t">
                    <Button
                      variant="default"
                      type="submit"
                      className="w-full py-2 flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isLogin ? "Logging in..." : "Registering..."}
                        </>
                      ) : isLogin ? (
                        "Login"
                      ) : (
                        "Register"
                      )}
                    </Button>

                    <Button
                      variant="link"
                      onClick={toggleMode}
                      className="w-full text-sm text-primary"
                      type="button"
                    >
                      {isLogin
                        ? "Don't have an account? Register"
                        : "Already have an account? Login"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ForgotPasswordDialog
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
}

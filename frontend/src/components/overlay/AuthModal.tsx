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

// Password strength helper
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
  const [passwordStrength, setPasswordStrength] = useState({ level: "", color: "" });

  const ids = {
    firstName: useId(),
    lastName: useId(),
    username: useId(),
    email: useId(),
    password: useId(),
    confirmPassword: useId(),
  };

  useEffect(() => {
    // Reset form when switching modes
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
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (!isLogin && id === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = () => {
    const { firstName, lastName, username, email, password, confirmPassword } = formData;

    if (isLogin) {
      if (!username && !email) return "Enter username or email.";
      if (!password) return "Enter password.";
      if (password.length < 8) return "Password must be at least 8 characters.";
    } else {
      const nameRegex = /^[A-Za-z]+$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!firstName || !lastName || !username || !email || !password || !confirmPassword)
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
      closeModal();
    } catch (err: unknown) {
      if (err instanceof Error) setErrors(err.message || "Something went wrong.");
      else setErrors("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md relative"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="rounded-xl border shadow-md bg-background relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 p-0 hover:bg-muted/20"
                onClick={closeModal}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>

              <form onSubmit={handleSubmit}>
                <CardHeader className="space-y-1.5 p-6 pt-8">
                  <CardTitle className="text-2xl font-semibold">
                    {isLogin ? "Login" : "Register"}
                  </CardTitle>
                  <CardDescription>
                    {isLogin ? "Welcome back!" : "Create your account to continue."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 p-6 pt-0">
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
                          />
                        </div>
                        <div>
                          <Label htmlFor={ids.lastName}>Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
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
                      <Label htmlFor={ids.username}>Username or Email</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username or email"
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
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
                      <Label htmlFor={ids.confirmPassword}>Confirm Password</Label>
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {errors && <p className="text-red-500 text-sm mt-2">{errors}</p>}
                </CardContent>

                <CardFooter className="flex flex-col gap-2 p-6 pt-0">
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
                    className="w-full text-sm"
                    type="button"
                  >
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

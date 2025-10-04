import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isRegister?: boolean;
  onClose?: () => void;
  isOpen: boolean;
}

function AuthModal({ isRegister = false, onClose, isOpen=true }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(!isRegister);

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
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Card className="rounded-xl border shadow-md bg-background">
              {/* Close button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-4 right-4 p-0 hover:bg-muted/20"
                onClick={onClose}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>

              <CardHeader className="space-y-1.5 p-6 pt-8">
                <CardTitle className="text-2xl font-semibold">{isLogin ? "Login" : "Register"}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {isLogin ? "Welcome back! Please login." : "Create your account to continue."}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 p-6 pt-0">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" className="rounded-md" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" className="rounded-md" />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="username">{isLogin ? "Username or Email" : "Username"}</Label>
                  <Input id="username" placeholder="ex. johndoe" className="rounded-md" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="********" className="rounded-md" />
                </div>

                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="********" className="rounded-md" />
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 p-6 pt-0">
                <Button variant="default" className="w-full py-2">{isLogin ? "Login" : "Register"}</Button>
                <Button 
                  variant="link" 
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-sm"
                >
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;

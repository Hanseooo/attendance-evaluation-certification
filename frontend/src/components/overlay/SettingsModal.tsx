"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Moon, Sun, Monitor, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileForm {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

interface PasswordForm {
  password: string;
  confirm_password: string;
}

const BASE_URL =
  "https://attendance-evaluation-certification-production.up.railway.app";

export default function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user, token } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [loading, setLoading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<
    "success" | "error" | null
  >(null);
  const [profileStatus, setProfileStatus] = useState<
    "success" | "error" | null
  >(null);

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    defaultValues: { password: "", confirm_password: "" },
  });

  const password = passwordForm.watch("password");
  const confirmPassword = passwordForm.watch("confirm_password");
  const passwordsMismatch =
    password && confirmPassword && password.trim() !== confirmPassword.trim();

  // Fade out alerts after a few seconds
  useEffect(() => {
    if (passwordStatus || profileStatus) {
      const timer = setTimeout(() => {
        setPasswordStatus(null);
        setProfileStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordStatus, profileStatus]);

  // 🌙 THEME SWITCHER
  const handleThemeChange = (mode: string) => {
    setTheme(mode);
    if (mode === "system") {
      localStorage.removeItem("theme");
      document.documentElement.classList.toggle(
        "dark",
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } else {
      localStorage.setItem("theme", mode);
      document.documentElement.classList.toggle("dark", mode === "dark");
    }
    toast.success(`Theme set to ${mode}`);
  };

  // 👤 PROFILE SAVE
  const handleProfileSave = async (values: ProfileForm) => {
    if (!token) return toast.error("You must be logged in.");
    setLoading(true);
    setProfileStatus(null);

    try {
      const res = await fetch(`${BASE_URL}/api/user/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        setProfileStatus("error");
        toast.error("Failed to update profile.");
        return;
      }

      setProfileStatus("success");
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileStatus("error");
      toast.error("Network error: Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // 🔒 PASSWORD CHANGE
  const handlePasswordChange = async (values: PasswordForm) => {
    if (!token) return toast.error("You must be logged in.");
    if (passwordsMismatch) return setPasswordStatus("error");

    setSavingPassword(true);
    setPasswordStatus(null);

    try {
      const res = await fetch(
        `${BASE_URL}/dj-rest-auth/password/change/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            new_password1: values.password,
            new_password2: values.confirm_password,
          }),
        }
      );

      if (!res.ok) {
        setPasswordStatus("error");
        toast.error("Failed to change password.");
        return;
      }

      setPasswordStatus("success");
      toast.success("Password updated successfully!");
      passwordForm.reset();
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordStatus("error");
      toast.error("Network error while changing password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // ✨ Animated Alert
  const GradientAlert = ({
    status,
    title,
    description,
  }: {
    status: "success" | "error";
    title: string;
    description: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Alert
        className={`mt-4 border ${
          status === "success"
            ? "border-primary text-primary"
            : "border-destructive text-destructive"
        } bg-gradient-to-tr from-primary/10 via-background/10 to-foreground/10`}
      >
        {status === "success" ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </motion.div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full bg-card text-card-foreground rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="account" className="px-6">
          <TabsList className="grid grid-cols-2 mb-4 w-full">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* ACCOUNT TAB */}
          <TabsContent value="account">
            <div className="max-h-[65vh] overflow-y-auto space-y-6 pb-6">
              {/* PROFILE FORM */}
              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSave)}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        Update your basic information below.
                      </p>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} type="text" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} type="text" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 mt-4">
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} type="text" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>

                    <CardFooter className="justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>

                    <AnimatePresence>
                      {profileStatus && (
                        <CardContent>
                          <GradientAlert
                            status={profileStatus}
                            title={
                              profileStatus === "success"
                                ? "Profile Updated"
                                : "Error Updating Profile"
                            }
                            description={
                              profileStatus === "success"
                                ? "Your profile was successfully updated."
                                : "Something went wrong. Please try again."
                            }
                          />
                        </CardContent>
                      )}
                    </AnimatePresence>
                  </Card>
                </form>
              </Form>

              {/* PASSWORD FORM */}
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Change Password</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a strong, unique password.
                      </p>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        rules={{
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message:
                              "Password must be at least 8 characters long",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirm_password"
                        rules={{
                          required: "Please confirm your password",
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            {passwordsMismatch && (
                              <p className="text-sm text-destructive mt-1">
                                Passwords do not match
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>

                    <CardFooter className="justify-end">
                      <Button type="submit" disabled={savingPassword}>
                        {savingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </CardFooter>

                    <AnimatePresence>
                      {passwordStatus && (
                        <CardContent>
                          <GradientAlert
                            status={passwordStatus}
                            title={
                              passwordStatus === "success"
                                ? "Password Changed"
                                : "Error Changing Password"
                            }
                            description={
                              passwordStatus === "success"
                                ? "Your password was successfully updated."
                                : "Something went wrong. Please try again."
                            }
                          />
                        </CardContent>
                      )}
                    </AnimatePresence>
                  </Card>
                </form>
              </Form>
            </div>
          </TabsContent>

          {/* SYSTEM TAB */}
          <TabsContent value="system">
            <div className="max-h-[65vh] overflow-y-auto space-y-6 pb-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred appearance.
                  </p>
                </CardHeader>
                <CardContent className="flex justify-around flex-wrap gap-3">
                  {[
                    { mode: "light", icon: Sun, label: "Light" },
                    { mode: "dark", icon: Moon, label: "Dark" },
                    { mode: "system", icon: Monitor, label: "System" },
                  ].map(({ mode, icon: Icon, label }) => (
                    <Button
                      key={mode}
                      variant={theme === mode ? "default" : "outline"}
                      className="flex items-center gap-2"
                      onClick={() => handleThemeChange(mode)}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

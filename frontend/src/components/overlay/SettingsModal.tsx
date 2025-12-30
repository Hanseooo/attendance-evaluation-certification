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
import {
  Moon,
  Sun,
  Monitor,
  CheckCircle,
  XCircle,
  Mail,
  Clock,
} from "lucide-react";
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
import { API_BASE_URL } from "@/api/baseUrl";
import { Checkbox } from "../ui/checkbox";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";

interface ProfileForm {
  first_name: string;
  last_name: string;
  username: string;
}

interface EmailChangeForm {
  new_email: string;
  code: string;
}

interface PasswordForm {
  password: string;
  confirm_password: string;
}

const BASE_URL = API_BASE_URL;

export default function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user, token, refreshUser } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [loading, setLoading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<
    "success" | "error" | null
  >(null);
  const [profileStatus, setProfileStatus] = useState<
    "success" | "error" | null
  >(null);

  // Email change states
  const [emailChangeStatus, setEmailChangeStatus] = useState<
    "success" | "error" | null
  >(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(
    null
  );

  const { enabled, toggle } = useEmailNotifications();


  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
    },
  });

  const emailChangeForm = useForm<EmailChangeForm>({
    defaultValues: {
      new_email: "",
      code: "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    defaultValues: { password: "", confirm_password: "" },
  });

  const password = passwordForm.watch("password");
  const confirmPassword = passwordForm.watch("confirm_password");
  const passwordsMismatch =
    password && confirmPassword && password.trim() !== confirmPassword.trim();

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  // Fade out alerts after a few seconds
  useEffect(() => {
    if (passwordStatus || profileStatus || emailChangeStatus) {
      const timer = setTimeout(() => {
        setPasswordStatus(null);
        setProfileStatus(null);
        setEmailChangeStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordStatus, profileStatus, emailChangeStatus]);

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
      await refreshUser?.();
    } catch (err) {
      console.error("Error saving profile:", err);
      setProfileStatus("error");
      toast.error("Network error: Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // 📧 REQUEST EMAIL CHANGE CODE
  const handleSendCode = async () => {
    const newEmail = emailChangeForm.getValues("new_email");

    if (!newEmail || !newEmail.trim()) {
      toast.error("Please enter a new email address");
      return;
    }

    if (!token) return toast.error("You must be logged in.");

    setSendingCode(true);
    setEmailChangeStatus(null);
    setRemainingAttempts(null);

    try {
      const res = await fetch(`${BASE_URL}/api/request-email-change/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ new_email: newEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          // Rate limited
          const match = data.error?.match(/(\d+) seconds/);
          if (match) {
            setCooldownTime(parseInt(match[1]));
          }
        }
        toast.error(data.error || "Failed to send verification code.");
        return;
      }

      setCodeSent(true);
      setCooldownTime(60);
      toast.success("Verification code sent to your new email!");
    } catch (err) {
      console.error("Error sending code:", err);
      toast.error("Network error: Unable to send verification code.");
    } finally {
      setSendingCode(false);
    }
  };

  // ✅ VERIFY EMAIL CHANGE
  const handleVerifyEmailChange = async (values: EmailChangeForm) => {
    if (!token) return toast.error("You must be logged in.");

    if (!values.new_email || !values.code) {
      toast.error("Please enter both email and verification code");
      return;
    }

    setVerifyingCode(true);
    setEmailChangeStatus(null);

    try {
      const res = await fetch(`${BASE_URL}/api/verify-email-change/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          new_email: values.new_email,
          code: values.code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailChangeStatus("error");
        if (data.remaining_attempts !== undefined) {
          setRemainingAttempts(data.remaining_attempts);
          toast.error(
            `${data.error} (${data.remaining_attempts} attempts remaining)`
          );
        } else {
          toast.error(data.error || "Failed to verify code.");
        }
        return;
      }

      setEmailChangeStatus("success");
      toast.success("Email updated successfully!");

      // Reset form and states
      emailChangeForm.reset();
      setCodeSent(false);
      setCooldownTime(0);
      setRemainingAttempts(null);

      // Refresh user data
      await refreshUser?.();
    } catch (err) {
      console.error("Error verifying code:", err);
      setEmailChangeStatus("error");
      toast.error("Network error: Unable to verify code.");
    } finally {
      setVerifyingCode(false);
    }
  };

  // 🔒 PASSWORD CHANGE
  const handlePasswordChange = async (values: PasswordForm) => {
    if (!token) return toast.error("You must be logged in.");
    if (passwordsMismatch) return setPasswordStatus("error");

    setSavingPassword(true);
    setPasswordStatus(null);

    try {
      const res = await fetch(`${BASE_URL}/dj-rest-auth/password/change/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          new_password1: values.password,
          new_password2: values.confirm_password,
        }),
      });

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

                        <Card>
                          <CardHeader>
                            <h3 className="text-lg font-semibold">
                              Email Notifications
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Control whether you receive email updates about
                              seminars.
                            </p>
                          </CardHeader>

                          <CardContent>
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id="email-notifications"
                                checked={enabled}
                                disabled={loading}
                                onCheckedChange={(checked) =>
                                  toggle(Boolean(checked))
                                }
                              />

                              <label
                                htmlFor="email-notifications"
                                className="text-sm leading-snug cursor-pointer"
                              >
                                <span className="font-medium">
                                  Receive seminar email notifications
                                </span>
                                <p className="text-muted-foreground">
                                  Includes title, date, venue, and speaker.
                                </p>
                              </label>
                            </div>
                          </CardContent>
                        </Card>

                        {/* READ-ONLY EMAIL */}
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  Current
                                </span>
                              </div>
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use the "Change Email" section below to update your
                            email
                          </p>
                        </FormItem>
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

              {/* EMAIL CHANGE FORM */}
              <Form {...emailChangeForm}>
                <form
                  onSubmit={emailChangeForm.handleSubmit(
                    handleVerifyEmailChange
                  )}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Change Email
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enter a new email address and verify with a code.
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={emailChangeForm.control}
                          name="new_email"
                          rules={{
                            required: "Email is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Invalid email format",
                            },
                          }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Email Address</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="new.email@example.com"
                                    disabled={codeSent}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  onClick={handleSendCode}
                                  disabled={
                                    sendingCode || cooldownTime > 0 || codeSent
                                  }
                                  variant="outline"
                                  className="whitespace-nowrap"
                                >
                                  {sendingCode ? (
                                    "Sending..."
                                  ) : cooldownTime > 0 ? (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {cooldownTime}s
                                    </span>
                                  ) : codeSent ? (
                                    "Code Sent"
                                  ) : (
                                    "Send Code"
                                  )}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {codeSent && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                          >
                            <FormField
                              control={emailChangeForm.control}
                              name="code"
                              rules={{
                                required: "Verification code is required",
                                pattern: {
                                  value: /^\d{6}$/,
                                  message: "Code must be 6 digits",
                                },
                              }}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Verification Code</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="text"
                                      placeholder="123456"
                                      maxLength={6}
                                      className="font-mono text-lg tracking-widest"
                                    />
                                  </FormControl>
                                  {remainingAttempts !== null && (
                                    <p className="text-sm text-destructive">
                                      {remainingAttempts} attempts remaining
                                    </p>
                                  )}
                                  <FormMessage />
                                  <p className="text-xs text-muted-foreground">
                                    Code expires in 1 hour. Check your new email
                                    inbox.
                                  </p>
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}
                      </div>
                    </CardContent>

                    {codeSent && (
                      <CardFooter className="flex justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            emailChangeForm.reset();
                            setCodeSent(false);
                            setCooldownTime(0);
                            setRemainingAttempts(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={verifyingCode}>
                          {verifyingCode
                            ? "Verifying..."
                            : "Verify & Change Email"}
                        </Button>
                      </CardFooter>
                    )}

                    <AnimatePresence>
                      {emailChangeStatus && (
                        <CardContent>
                          <GradientAlert
                            status={emailChangeStatus}
                            title={
                              emailChangeStatus === "success"
                                ? "Email Changed"
                                : "Error Changing Email"
                            }
                            description={
                              emailChangeStatus === "success"
                                ? "Your email was successfully updated."
                                : "Failed to verify code. Please try again."
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

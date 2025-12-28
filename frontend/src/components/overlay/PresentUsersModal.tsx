import { useEffect, useState, useMemo } from "react";
import { useAttendanceApi } from "@/hooks/useAttendanceApi";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  User,
  Copy,
  Mail,
  Search,
  Check,
  SendHorizonal,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { type Attendee } from "@/utils/types";
import { API_BASE_URL } from "@/api/baseUrl";

interface PresentUsersModalProps {
  seminarId: number;
  seminarTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const BASE_URL = API_BASE_URL

export function PresentUsersModal({
  seminarId,
  seminarTitle,
  isOpen,
  onClose,
}: PresentUsersModalProps) {
  const { getPresentUsers } = useAttendanceApi();
  const { token } = useAuth();

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedNames, setCopiedNames] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);

  const [confirmUser, setConfirmUser] = useState<Attendee | null>(null);
  const [certificateDialog, setCertificateDialog] = useState<{
    base64: string;
    email: string;
  } | null>(null);
  const [sendingCertificate, setSendingCertificate] = useState(false);

  useEffect(() => {
    if (!isOpen || !seminarId) return;
    setLoading(true);
    setAttendees([]);

    getPresentUsers(seminarId)
      .then((res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          setAttendees(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch attendees");
      })
      .finally(() => setLoading(false));
  }, [isOpen, seminarId]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter((u) => {
      const q = searchTerm.toLowerCase();
      return (
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q))
      );
    });
  }, [attendees, searchTerm]);

  const copyNames = () => {
    const names = filteredAttendees
      .map((u) => `${u.first_name} ${u.last_name}`)
      .join("\n");
    navigator.clipboard.writeText(names);
    setCopiedNames(true);
    toast.success("Copied all participant names!");
    setTimeout(() => setCopiedNames(false), 2000);
  };

  const copyEmails = () => {
    const emails = filteredAttendees.map((u) => u.email).join("\n");
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    toast.success("Copied all participant emails!");
    setTimeout(() => setCopiedEmails(false), 2000);
  };

  const resendCertificate = async (user: Attendee) => {
    if (!token) return toast.error("Missing auth token");

    setSendingCertificate(true);

    try {
      const res = await fetch(
        `${BASE_URL}/api/resend-certificate/${seminarId}/${user.id}/`,

        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok && data.status === "success") {
        setCertificateDialog({
          base64: data.certificate_base64,
          email: user.email, // now always uses the correct attendee email
        });
        setConfirmUser(null);
      } else {
        toast.error(data.message || "Failed to send certificate");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send certificate");
    } finally {
      setSendingCertificate(false);
    }
  };


  return (
    <>
      {/* MAIN MODAL */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md sm:max-w-lg bg-background border border-border/40 shadow-2xl rounded-2xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              {seminarTitle} <br />
              <span className="text-muted-foreground text-sm">
                Present Participants
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or username..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={copyNames}
                title="Copy all names"
                className={`transition-all ${copiedNames ? "bg-green-500/20 text-green-600" : ""}`}
              >
                {copiedNames ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={copyEmails}
                title="Copy all emails"
                className={`transition-all ${copiedEmails ? "bg-green-500/20 text-green-600" : ""}`}
              >
                {copiedEmails ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <ScrollArea className="max-h-[400px] sm:max-h-[500px] rounded-md overflow-auto border border-border/30">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAttendees.length > 0 ? (
              <ul className="divide-y divide-border/40">
                {filteredAttendees.map((user, index) => (
                  <li
                    key={user.id}
                    className={`flex items-center justify-between gap-3 py-3 px-3 transition-all ${
                      index % 2 === 0
                        ? "bg-muted/50 hover:bg-muted/70"
                        : "bg-background hover:bg-muted/50"
                    } rounded-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary shadow-inner">
                        <User className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* RESEND CERTIFICATE BUTTON */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="hover:bg-primary/10"
                            onClick={() => setConfirmUser(user)}
                          >
                            <SendHorizonal className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Resend certificate to email
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No participants found.
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={!!confirmUser} onOpenChange={() => setConfirmUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg">Resend certificate?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2">
            Resend certificate to{" "}
            <span className="font-medium">{confirmUser?.email}</span>?
          </p>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmUser(null)}>
              No
            </Button>
            <Button
              onClick={() => confirmUser && resendCertificate(confirmUser)}
              disabled={sendingCertificate}
            >
              {sendingCertificate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CERTIFICATE PREVIEW DIALOG */}
      <Dialog
        open={!!certificateDialog}
        onOpenChange={() => setCertificateDialog(null)}
      >
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg">Certificate Sent!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {certificateDialog && (
              <>
                <img
                  src={certificateDialog.base64}
                  alt="Certificate"
                  className="max-w-full rounded-md border border-border"
                />
                <p className="text-sm text-muted-foreground">
                  Certificate has been sent to{" "}
                  <span className="font-medium">{certificateDialog.email}</span>{" "}
                  successfully.
                </p>
                <Button onClick={() => setCertificateDialog(null)}>
                  Close
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

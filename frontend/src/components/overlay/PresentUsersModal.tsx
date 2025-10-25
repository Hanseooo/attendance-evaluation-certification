import { useEffect, useState, useMemo } from "react";
import { useAttendanceApi } from "@/hooks/useAttendanceApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User, Copy, Mail, Search, Check } from "lucide-react";
import { type Attendee } from "@/utils/types";
import { toast } from "sonner";

interface PresentUsersModalProps {
  seminarId: number;
  seminarTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PresentUsersModal({
  seminarId,
  seminarTitle,
  isOpen,
  onClose,
}: PresentUsersModalProps) {
  const { getPresentUsers } = useAttendanceApi();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedNames, setCopiedNames] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);

  useEffect(() => {
    if (!isOpen || !seminarId) return;
    setLoading(true);

    getPresentUsers(seminarId)
      .then((res) => {
        if (res.status === 200) {
          const participants = res.data
          setAttendees(participants);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, seminarId]);

  const filteredAttendees = useMemo(() => {
    return attendees.filter((user) => {
      const q = searchTerm.toLowerCase();
      return (
        user.first_name.toLowerCase().includes(q) ||
        user.last_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.username && user.username.toLowerCase().includes(q))
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

  return (
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
              className={`transition-all ${
                copiedNames ? "bg-green-500/20 text-green-600" : ""
              }`}
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
              className={`transition-all ${
                copiedEmails ? "bg-green-500/20 text-green-600" : ""
              }`}
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
                  className={`flex items-center gap-3 py-3 px-3 transition-all ${
                    index % 2 === 0
                      ? "bg-muted/50 hover:bg-muted/70"
                      : "bg-background hover:bg-muted/50"
                  } rounded-lg`}
                >
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
  );
}

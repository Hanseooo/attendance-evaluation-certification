import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Image,
  MoreVertical,
  Pencil,
  QrCode,
  Trash2,
  Users,
  BarChart3,
} from "lucide-react";
import { type Seminar } from "@/utils/types";
import { PresentUsersModal } from "@/components/overlay/PresentUsersModal";
import EvaluationAnalyticsModal from "../overlay/EvaluationAnalyticsModal";

interface AdminSeminarCardProps {
  seminar: Seminar;
  onEdit: () => void;
  onDelete: () => void;
  showQrModal: () => void;
  onUploadCert: () => void;
}

export default function AdminSeminarCard({
  seminar,
  onEdit,
  onDelete,
  showQrModal,
  onUploadCert,
}: AdminSeminarCardProps) {
  const [showPresentUsers, setShowPresentUsers] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <>
      <Card className="border border-border/50 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 w-full">
        {/* Header */}
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <CardTitle className="text-base font-semibold leading-tight tracking-tight max-w-[80%] truncate">
            {seminar.title}
          </CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40 bg-background">
              <DropdownMenuItem
                onClick={onEdit}
                className="gap-2 hover:cursor-pointer hover:bg-secondary"
              >
                <Pencil className="size-4  " />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 hover:cursor-pointer hover:bg-secondary text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>

              {/* Only show generate/upload when seminar is not done */}
              {!seminar.is_done && (
                <>
                  <DropdownMenuItem
                    onClick={showQrModal}
                    className="gap-2 hover:cursor-pointer hover:bg-secondary"
                  >
                    <QrCode className="size-4 " />
                    Generate QR
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onUploadCert}
                    className="gap-2 hover:cursor-pointer hover:bg-secondary"
                  >
                    <Image className="size-4 " />
                    Upload Cert
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground line-clamp-2">
            {seminar.description}
          </p>

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>{new Date(seminar.date_start).toLocaleDateString()}</p>
            <p>Speaker: {seminar.speaker}</p>
            <p>Duration: {seminar.duration_minutes ?? "—"} mins</p>
            <p>{seminar.venue ?? "—"}</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 flex-1 sm:flex-none"
              onClick={() => setShowPresentUsers(true)}
            >
              <Users className="h-4 w-4" /> Attendees
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-1 flex-1 sm:flex-none"
              onClick={() => setShowAnalytics(true)}
            >
              <BarChart3 className="h-4 w-4" /> Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <PresentUsersModal
        isOpen={showPresentUsers}
        onClose={() => setShowPresentUsers(false)}
        seminarId={seminar.id}
        seminarTitle={seminar.title}
      />

      <EvaluationAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        seminarId={seminar.id}
      />
    </>
  );
}

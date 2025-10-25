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
} from "lucide-react";
import { type Seminar } from "@/utils/types";
import { PresentUsersModal } from "@/components/overlay/PresentUsersModal";

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

  return (
    <>
      <Card
        onClick={() => setShowPresentUsers(true)}
        className="border border-border/50 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <CardTitle className="text-base font-semibold leading-tight tracking-tight">
            {seminar.title}
          </CardTitle>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()} // ✅ Prevent modal open on trigger
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 bg-background"
              onClick={(e) => e.stopPropagation()} // ✅ Prevent modal open on menu clicks
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex items-center gap-2 hover:bg-black/5 hover:cursor-pointer"
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex items-center gap-2 hover:bg-black/5 text-destructive focus:text-destructive hover:cursor-pointer"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  showQrModal();
                }}
                className="flex items-center gap-2 hover:bg-black/5 hover:cursor-pointer"
              >
                <QrCode className="size-4" />
                Generate
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadCert();
                }}
                className="flex items-center gap-2 hover:bg-black/5 hover:cursor-pointer"
              >
                <Image className="size-4" />
                Upload
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground line-clamp-2">
            {seminar.description}
          </p>
          <div className="pt-2 text-xs text-muted-foreground">
            <p>{new Date(seminar.date_start).toLocaleDateString()}</p>
            <p>Duration: {seminar.duration_minutes} mins</p>
            <p>{seminar.venue}</p>
          </div>
          <div className="flex items-center justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={(e) => {
                e.stopPropagation();
                setShowPresentUsers(true);
              }}
            >
              <Users className="h-4 w-4" /> View Attendees
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <PresentUsersModal
        isOpen={showPresentUsers}
        onClose={() => setShowPresentUsers(false)}
        seminarId={seminar.id}
        seminarTitle={seminar.title}
      />
    </>
  );
}

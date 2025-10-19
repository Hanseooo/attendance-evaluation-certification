import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, QrCode, Trash2 } from "lucide-react"
import { type Seminar } from "@/utils/types"

interface AdminSeminarCardProps {
  seminar: Seminar
  onEdit: () => void
  onDelete: () => void
  showQrModal: () => void
}

export default function AdminSeminarCard({ seminar, onEdit, onDelete, showQrModal }: AdminSeminarCardProps) {


  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
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
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-background">
            <DropdownMenuItem
              onClick={onEdit}
              className="flex items-center gap-2 hover:cursor-pointer hover:bg-black/5"
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 hover:cursor-pointer text-destructive focus:text-destructive hover:bg-black/5"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={showQrModal}
              className="flex items-center gap-2 hover:cursor-pointer hover:bg-black/5"
            >
              <QrCode className="size-4" />
              Generate
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
      </CardContent>
    </Card>
  );
}

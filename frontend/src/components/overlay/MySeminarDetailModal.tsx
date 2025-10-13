import { MapPin, Calendar, Clock, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Seminar {
  id: number;
  title: string;
  description: string;
  speaker: string;
  venue: string;
  date_start: string;
  date_end: string;
  duration_minutes: number;
  is_done: boolean;
}

interface MySeminarDetailModalProps {
  seminar: Seminar;
  isOpen: boolean;
  onClose: () => void;
  onCancelAttendance?: (seminarId: number) => void;
}

export function MySeminarDetailModal({
  seminar,
  isOpen,
  onClose,
  onCancelAttendance,
}: MySeminarDetailModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelAttendance = () => {
    if (onCancelAttendance) {
      onCancelAttendance(seminar.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - Blurred and Darkened */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header - Sticky */}
        <div className="px-6 pt-6 pb-4 bg-background/95 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold leading-tight pr-2">
                {seminar.title}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-muted flex-shrink-0 -mt-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto detail-scrollbar px-6 py-5">
          {/* Description */}
          {seminar.description && (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {seminar.description}
              </p>
              <Separator className="my-5" />
            </>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Speaker */}
            {seminar.speaker && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Speaker
                  </p>
                  <p className="text-sm font-semibold mt-0.5 truncate">
                    {seminar.speaker}
                  </p>
                </div>
              </div>
            )}

            {/* Venue */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Venue
                </p>
                <p className="text-sm font-semibold mt-0.5 truncate">
                  {seminar.venue}
                </p>
              </div>
            </div>

            {/* Start Date & Time */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Start
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {formatDate(seminar.date_start)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatTime(seminar.date_start)}
                </p>
              </div>
            </div>

            {/* End Date & Time */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  End
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {formatDate(seminar.date_end)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatTime(seminar.date_end)}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors sm:col-span-2">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Duration
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {seminar.duration_minutes} minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="px-6 py-4 bg-background/95 backdrop-blur-sm border-t sticky bottom-0">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            {onCancelAttendance && (
              <Button
                variant="destructive"
                onClick={handleCancelAttendance}
                className="w-full sm:w-auto"
              >
                Cancel Attendance
              </Button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .detail-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .detail-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.3);
          border-radius: 4px;
        }

        .detail-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.4);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .detail-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.6);
        }

        .detail-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--primary) / 0.4) hsl(var(--muted) / 0.3);
        }
      `}</style>
    </div>
  );
}
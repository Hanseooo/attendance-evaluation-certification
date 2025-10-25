import { useState } from "react";
import { MapPin, Calendar, Clock, User, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MySeminarDetailModal } from "@/components/overlay/MySeminarDetailModal";
import { type MySeminar } from "@/utils/types"

interface UpcomingSeminarCardProps {
  seminar: MySeminar | null;
  onCancelAttendance?: (seminarId: number) => void;
}

export default function UpcomingSeminarCard({
  seminar,
  onCancelAttendance,
}: UpcomingSeminarCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!seminar) {
    return (
      <Card className="relative overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group h-full">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No upcoming seminars</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            You don't have any seminars scheduled yet. Browse available seminars
            and register to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

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

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const seminarDate = new Date(dateString);
    const diffMs = seminarDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `In ${diffDays} ${diffDays === 1 ? "day" : "days"}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
    }
    return "Starting soon";
  };

  return (
    <>
<Card className="relative overflow-hidden border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg group">
  <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/5 rounded-full" />
        <CardContent className="p-6 md:p-8 relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <Badge
                variant="secondary"
                className="mb-3 bg-primary/10 text-primary hover:bg-primary/20"
              >
                {getTimeUntil(seminar.seminar.date_start)}
              </Badge>
              <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                {seminar.seminar.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
                {seminar.seminar.description}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Speaker */}
            {seminar.seminar.speaker && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Speaker</p>
                  <p className="text-sm font-semibold truncate">
                    {seminar.seminar.speaker}
                  </p>
                </div>
              </div>
            )}

            {/* Venue */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="text-sm font-semibold truncate">{seminar.seminar.venue}</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm font-semibold">
                  {formatDate(seminar.seminar.date_start)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatTime(seminar.seminar.date_start)}
                </p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-semibold">
                  {seminar.seminar.duration_minutes} min
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto group/btn"
          >
            View Details
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </CardContent>
      </Card>

      <MySeminarDetailModal
        seminar={seminar}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCancelAttendance={onCancelAttendance}
      />
    </>
  );
}
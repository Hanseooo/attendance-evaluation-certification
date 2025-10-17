import { useState } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MySeminarDetailModal } from "@/components/overlay/MySeminarDetailModal";
import { type MySeminar } from "@/utils/types"



interface MySeminarCardProps {
  seminar: MySeminar;
  onCancelAttendance?: (seminarId: number) => void;
}

export default function MySeminarCard({
  seminar,
  onCancelAttendance,
}: MySeminarCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Card
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/60 w-full h-full group"
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-5 h-full flex flex-col">
          {/* Title - Fixed height with consistent spacing */}
          <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-4 h-12 group-hover:text-primary transition-colors">
            {seminar.seminar.title}
          </h3>

          {/* Info Section - Takes remaining space */}
          <div className="space-y-2.5 mt-auto">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{seminar.seminar.venue}</span>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">
                {formatDate(seminar.seminar.date_start)} • {formatTime(seminar.seminar.date_start)}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{seminar.seminar.duration_minutes} min</span>
            </div>
          </div>
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
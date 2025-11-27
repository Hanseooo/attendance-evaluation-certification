import { useState } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SeminarDetailsModal } from "@/components/overlay/SeminarDetailsModal";
import { type Seminar } from "@/utils/types";

interface SeminarCardProps {
  seminar: Seminar;
}

export default function SeminarCard({ seminar }: SeminarCardProps) {
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
        className="cursor-pointer transition-all duration-100 hover:shadow-lg border-1 border-primary/50 hover:border-primary hover:border-2 w-full h-full group "
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-5 h-full flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-4 h-12 group-hover:text-primary transition-colors">
            {seminar.title}
          </h3>

          {/* Info Section */}
          <div className="space-y-2.5 mt-auto">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{seminar.venue}</span>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">
                {formatDate(seminar.date_start)} •{" "}
                {formatTime(seminar.date_start)}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{seminar.duration_minutes} min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <SeminarDetailsModal
        seminar={seminar}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAttend={() => {} }
      />
    </>
  );
}

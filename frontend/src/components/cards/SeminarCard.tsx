import { MapPin, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type Seminar = {
  id: number;
  title: string;
  description: string;
  speaker?: string;
  venue: string;
  date_start: string;
  date_end?: string;
  duration_minutes?: number;
  is_done?: boolean;
};

interface Props {
  seminar: Seminar;
  onClick?: (seminar: Seminar) => void;
  className?: string;
}

export default function SeminarCard({ seminar, onClick, className = "" }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(seminar)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(seminar);
      }}
      aria-label={`Open seminar details for ${seminar.title}`}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/60 group rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
    >
      <Card className="w-full h-full">
        <CardContent className="p-5 h-full flex flex-col">
          <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-4 h-12 group-hover:text-primary transition-colors">
            {seminar.title}
          </h3>

          <div className="space-y-2.5 mt-auto">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{seminar.venue}</span>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap">
                {formatDate(seminar.date_start)} • {formatTime(seminar.date_start)}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{seminar.duration_minutes ?? "TBA"} min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
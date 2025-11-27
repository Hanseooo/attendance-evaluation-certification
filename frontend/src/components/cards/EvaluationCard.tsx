import { Calendar, MapPin, Mic, Clock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Seminar } from "@/utils/types";

interface EvaluationCardProps {
  seminar: Seminar;
  onOpen: () => void;
}

export default function EvaluationCard({ seminar, onOpen }: EvaluationCardProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card
      className="cursor-pointer border-primary/50 border-2 bg-muted/75 transition-all duration-200 hover:shadow-lg hover:border-primary/60 w-full h-full group"
      onClick={onOpen}
    >
      <CardContent className="p-5 h-full flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-base leading-tight line-clamp-2 mb-4 h-12 group-hover:text-primary transition-colors">
          {seminar.title}
        </h3>

        {/* Seminar details */}
        <div className="space-y-2.5 mt-auto text-muted-foreground text-sm">
          {/* Speaker */}
          {seminar.speaker && (
            <div className="flex items-center gap-2.5">
              <Mic className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{seminar.speaker}</span>
            </div>
          )}

          {/* Venue */}
          {seminar.venue && (
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{seminar.venue}</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatDate(seminar.date_start)}{" "}
              <span className="text-xs opacity-70">
                ({new Date(seminar.date_start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {new Date(seminar.date_end!).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </span>
            </span>
          </div>

          {/* Duration */}
          {seminar.duration_minutes && (
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{formatDuration(seminar.duration_minutes)}</span>
            </div>
          )}

          {/* Evaluate button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="default"
              className="flex items-center gap-2 group-hover:scale-[1.02] transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              <Star className="h-4 w-4" /> Evaluate
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

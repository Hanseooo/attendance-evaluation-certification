// src/components/cards/AttendedSeminarCard.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Award } from "lucide-react";
import type { AttendedSeminar } from "@/utils/types";
import { format } from "date-fns";

interface Props {
  attended: AttendedSeminar;
  className?: string;
}

export default function AttendedSeminarCard({
  attended,

  className = "",
}: Props) {
  const seminar = attended.seminar;
  const title = seminar.title;
  const dateStart = seminar.date_start ? new Date(seminar.date_start) : null;
  const dateEnd = seminar.date_end ? new Date(seminar.date_end) : null;

  const formatDateRange = () => {
    if (!dateStart) return "TBA";
    if (!dateEnd) return format(dateStart, "PPP p");
    // if same day
    if (
      dateStart.getFullYear() === dateEnd.getFullYear() &&
      dateStart.getMonth() === dateEnd.getMonth() &&
      dateStart.getDate() === dateEnd.getDate()
    ) {
      return `${format(dateStart, "PPP")} • ${format(dateStart, "p")} - ${format(
        dateEnd,
        "p"
      )}`;
    }
    return `${format(dateStart, "PPP p")} — ${format(dateEnd, "PPP p")}`;
  };

  return (
    <Card className={`h-full flex flex-col justify-between ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg line-clamp-2">
          {title}
        </CardTitle>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formatDateRange()}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 py-2">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <div>
                <div className="text-xs text-muted-foreground">Duration</div>
                <div className="text-sm font-medium">
                  {attended.duration_display ??
                    (attended.duration_minutes
                      ? `${attended.duration_minutes}m`
                      : "N/A")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {attended.certificate_issued ? (
                <Badge variant="secondary" className="uppercase text-xs">
                  <Award className="w-3 h-3 mr-1 inline" /> Certificate
                </Badge>
              ) : (
                <Badge variant="outline" className="uppercase text-xs">
                  Pending
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Checked in:{" "}
            <span className="font-medium">
              {attended.check_in_time
                ? format(new Date(attended.check_in_time), "PPP p")
                : "—"}
            </span>
            <br />
            Checked out:{" "}
            <span className="font-medium">
              {attended.check_out_time
                ? format(new Date(attended.check_out_time), "PPP p")
                : "—"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <div className="w-full flex items-center gap-2">
        </div>
      </CardFooter>
    </Card>
  );
}

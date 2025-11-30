// src/components/cards/AttendedSeminarCard.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User } from "lucide-react";
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
  const s = attended.seminar;
  const dateStart = s.date_start ? new Date(s.date_start) : null;
  const dateEnd = s.date_end ? new Date(s.date_end) : null;


  return (
    <Card className={`p-4 border border-primary min-h-[275px] ${className}`}>
      <CardHeader className="p-0 mb-3">
        <h3 className="font-semibold text-lg">{s.title}</h3>
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-3 text-sm">
        {/* Speaker */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>{s.speaker}</span>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{s.venue}</span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            {dateStart
              ? `${format(dateStart, "PPP p")} – ${dateEnd ? format(dateEnd, "p") : ""}`
              : "TBA"}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{s.duration_minutes} minutes</span>
        </div>

        {/* Check in/out */}
        <div className="mt-2 text-xs text-muted-foreground">
          <p>
            Check-in:{" "}
            <span className="font-medium">
              {attended.check_in_time
                ? format(new Date(attended.check_in_time), "PPP p")
                : "—"}
            </span>
          </p>
          <p>
            Check-out:{" "}
            <span className="font-medium">
              {attended.check_out_time
                ? format(new Date(attended.check_out_time), "PPP p")
                : "—"}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

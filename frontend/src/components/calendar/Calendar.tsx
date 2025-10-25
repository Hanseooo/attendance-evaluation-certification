import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seminar } from "@/utils/types";

interface CalendarProps {
  seminars: Seminar[];
}

export default function Calendar({ seminars }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => {
    setDirection("left");
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setDirection("right");
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getSeminarsForDay = (day: Date) =>
    seminars.filter((seminar) => isSameDay(new Date(seminar.date_start), day));

  const handleDayClick = (day: Date) => {
    const hasSeminar = getSeminarsForDay(day).length > 0;
    if (hasSeminar) {
      setSelectedDay(day);
      setOpen(true);
    }
  };

  return (
    <Card className="h-full bg-zinc-50 shadow-sm border border-border/85">
      <div className="p-4 flex justify-between items-center">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Days of the week */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground border-b border-border/40">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid with direction-aware animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: direction === "right" ? 40 : -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === "right" ? -40 : 40 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-7 gap-1 p-2 text-sm"
        >
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const hasSeminar = getSeminarsForDay(day).length > 0;
            const isToday = isSameDay(day, today);

            return (
              <motion.div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                whileTap={hasSeminar ? { scale: 1.05 } : {}}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-md text-center transition-all relative select-none",
                  !isCurrentMonth && "text-muted-foreground/40",
                  hasSeminar
                    ? "bg-black text-white cursor-pointer hover:bg-black/85"
                    : "text-foreground/80 cursor-default",
                  !hasSeminar && "hover:bg-transparent"
                )}
              >
                {format(day, "d")}
                {isToday && (
                  <div className="absolute inset-0 rounded-md ring-1 ring-primary/30 pointer-events-none bg-zinc-400/10" />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Drawer for seminars (original smooth version) */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-zinc-100 border-t mx-auto border-border p-4 sm:max-w-[95vw] rounded-t-3xl">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>
              {selectedDay ? format(selectedDay, "MMMM d, yyyy") : ""}
            </DrawerTitle>
          </DrawerHeader>

          <div className="mt-4 space-y-2">
            {selectedDay &&
              getSeminarsForDay(selectedDay).map((seminar) => (
                <Card
                  key={seminar.id}
                  className="p-3 bg-zinc-200/50 hover:bg-muted/80 transition-all"
                >
                  <p className="text-sm font-medium">{seminar.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(seminar.date_start), "h:mm a")} –{" "}
                    {format(new Date(seminar.date_end!), "h:mm a")}
                  </p>
                </Card>
              ))}
          </div>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}

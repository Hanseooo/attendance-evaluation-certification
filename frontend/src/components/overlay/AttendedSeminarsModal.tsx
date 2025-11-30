// src/components/overlays/AttendedSeminarsModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AttendedSeminarCard from "../cards/AttendedSeminarCard";
import type { AttendedSeminar } from "@/utils/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: AttendedSeminar[];
}

export default function AttendedSeminarsModal({
  open,
  onOpenChange,
  items,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>All Attended Seminars</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {items.map((att) => (
            <AttendedSeminarCard key={att.id} attended={att} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

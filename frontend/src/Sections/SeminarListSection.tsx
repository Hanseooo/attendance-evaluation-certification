// components/list/SeminarListSection.tsx
import { useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import SeminarCard from "@/components/cards/SeminarCard";
import { SeminarDetailsModal } from "@/components/overlay/SeminarDetailsModal";
import FiltersPopover from "@/components/popover/FiltersPopover";
import { type Seminar, type MySeminar } from "@/utils/types"
import { type Filters } from "@/utils/types";
import MySeminarCard from "@/components/cards/MySeminarCard";

type Props = {
  seminars: Seminar[] | null;
  mySeminars?: MySeminar[] | null; // add this
  attendingIds?: number[];
  onAttend?: (seminarId: number) => void | Promise<void>;
  className?: string;
};


export default function SeminarListSection({ seminars, mySeminars, attendingIds = [], onAttend, className = "" }: Props) {
  const [filters, setFilters] = useState<Filters>({
    sortField: "date",
    sortDir: "asc",
    hideAttending: true,
  });

  const [active, setActive] = useState<Seminar | null>(null);
  const [open, setOpen] = useState(false);

  // const openDetails = (s: Seminar) => {
  //   setActive(s);
  //   setOpen(true);
  // };

  const closeDetails = () => {
    setOpen(false);
    setTimeout(() => setActive(null), 150);
  };


  // Combine isAttending info: if attendingIds includes id, treat as attending
const processed = useMemo(() => {
  if (!seminars) return [];

  const list = seminars.map((s) => ({
    ...s,
    isAttending: attendingIds.includes(s.id),
  }));

  // ✅ Apply filter
  const filtered = filters.hideAttending
    ? list.filter((s) => !s.isAttending)
    : list;

  // ✅ Sort
  const dir = filters.sortDir === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    if (filters.sortField === "date") {
      return (
        (new Date(a.date_start).getTime() - new Date(b.date_start).getTime()) *
        dir
      );
    }
    if (filters.sortField === "duration") {
      return ((a.duration_minutes ?? 0) - (b.duration_minutes ?? 0)) * dir;
    }
    return 0;
  });

  return sorted;
}, [seminars, attendingIds, filters]);


  return (
    <section className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-background/0">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            Seminars
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Browse upcoming seminars
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FiltersPopover value={filters} onChange={setFilters} />
        </div>
      </div>

      <Separator className="mb-4" />

      <div className="h-[60vh] md:h-[70vh] overflow-y-auto modal-scrollbar px-1">
        {processed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground">No seminars</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              No seminars match the current filters. Try resetting filters or
              toggling hide attending.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {filters.hideAttending ? (
              // ✅ Hide attending → show only SeminarCard
              processed.map((s: Seminar) => (
                <div key={s.id} className="h-[220px]">
                  <SeminarCard seminar={s} />
                </div>
              ))
            ) : (
              // ✅ Show both attending and not attending
              <>
                {mySeminars?.map((ms) => (
                  <div key={`my-${ms.id}`} className="h-[220px]">
                    <MySeminarCard
                      seminar={ms}
                    />
                  </div>
                ))}
                {processed
                  .filter((s) => !attendingIds.includes(s.id))
                  .map((s: Seminar) => (
                    <div key={`other-${s.id}`} className="h-[220px]">
                      <SeminarCard seminar={s}  />
                    </div>
                  ))}
              </>
            )}
          </div>
        )}
      </div>

      <SeminarDetailsModal
        seminar={active ?? undefined}
        isOpen={open}
        onClose={closeDetails}
        onAttend={onAttend ?? (() => {})}
      />

      <style>{`
        /* re-use modal-scrollbar style used in other modals */
        .modal-scrollbar::-webkit-scrollbar { width: 10px; }
        .modal-scrollbar::-webkit-scrollbar-track { background: hsl(var(--muted) / 0.3); border-radius: 5px; margin: 8px 0; }
        .modal-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--primary) / 0.4); border-radius: 5px; transition: background 0.2s; }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.6); }
        .modal-scrollbar { scrollbar-width: thin; scrollbar-color: hsl(var(--primary) / 0.4) hsl(var(--muted) / 0.3); }
      `}</style>
    </section>
  );
}
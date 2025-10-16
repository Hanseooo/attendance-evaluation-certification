import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import  SeminarCard from "../components/cards/SeminarCard";
import { SeminarDetailsModal } from "../components/overlay/SeminarDetailsModal";
import { useState } from "react";
import { FeaturedSeminarsModal } from "@/components/overlay/FeaturedSeminarsModal";
import { type Seminar } from "@/utils/types"


type Props = {
  seminars: Seminar[];
  onAttend?: (seminarId: number) => Promise<void> | void;
  className?: string;
};

export default function FeaturedSeminarsSection({ seminars, onAttend, className = "" }: Props) {
  const [active, setActive] = useState<Seminar | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openBrowseAll, setOpenBrowseAll] = useState(false);

  const openCardDetails = (seminar: Seminar) => {
    setActive(seminar);
    setOpenDetails(true);
  };

  const closeCardDetails = () => {
    setOpenDetails(false);
    setTimeout(() => setActive(null), 150);
  };

  const handleAttend = async (id: number) => {
    await onAttend?.(id);
  };

  return (
    <>
      <section className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Featured seminars</h3>
            <p className="text-sm text-muted-foreground mt-1">Seminars you might like</p>
          </div>

          {seminars.length > 0 && (
            <Button variant="ghost" size="sm" className="group hover:bg-primary/10" onClick={() => setOpenBrowseAll(true)}>
              Browse Featured
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          )}
        </div>

        {seminars.length > 0 ? (
          <div className="relative">
            <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
              {seminars.map((s) => (
                <div key={s.id} className="snap-start flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-[220px]">
                  <SeminarCard seminar={s} onClick={openCardDetails} />
                </div>
              ))}
            </div>

            <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-lg">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2">No featured seminars</h4>
            <p className="text-sm text-muted-foreground max-w-md">We don't have any featured seminars at the moment. Check back later.</p>
          </div>
        )}
      </section>

      <SeminarDetailsModal seminar={active ?? undefined} isOpen={openDetails} onClose={closeCardDetails} onAttend={handleAttend} />

      <FeaturedSeminarsModal seminars={seminars} isOpen={openBrowseAll} onClose={() => setOpenBrowseAll(false)} onAttend={handleAttend} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: hsl(var(--muted)); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--primary) / 0.3); border-radius: 4px; transition: background 0.2s; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.5); }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: hsl(var(--primary) / 0.3) hsl(var(--muted)); }
      `}</style>
    </>
  );
}

import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import SeminarCard from "@/components/cards/SeminarCard";
import { SeminarDetailsModal } from "@/components/overlay/SeminarDetailsModal";
import { useState } from "react";
import { type Seminar } from "@/utils/types"


interface Props {
  seminars: Seminar[];
  isOpen: boolean;
  onClose: () => void;
  onAttend?: (seminarId: number) => void | Promise<void>;
}

export function FeaturedSeminarsModal({ seminars, isOpen, onClose, onAttend }: Props) {
  const [activeSeminar, setActiveSeminar] = useState<Seminar | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleOpenDetails = (s: Seminar) => {
    setActiveSeminar(s);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setTimeout(() => setActiveSeminar(null), 150);
  };

  const handleAttend = async (id: number) => {
    await onAttend?.(id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-7xl max-h-[90vh] bg-background border rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 rounded-t-xl">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured Seminars</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {seminars.length} {seminars.length === 1 ? "seminar" : "seminars"}
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto modal-scrollbar px-6 py-6">
          {seminars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
              {seminars.map((seminar) => (
                <div key={seminar.id} className="h-[220px]">
                  <SeminarCard seminar={seminar} onClick={() => handleOpenDetails(seminar)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">No featured seminars</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                There are no featured seminars available right now. Check back later.
              </p>
            </div>
          )}
        </div>

        <div className="border-t px-6 py-4 flex justify-end bg-background/95 backdrop-blur-sm sticky bottom-0 rounded-b-xl">
          <Button variant="outline" onClick={onClose} className="min-w-24 font-medium">Close</Button>
        </div>
      </div>

      <style>{`
        .modal-scrollbar::-webkit-scrollbar { width: 10px; }
        .modal-scrollbar::-webkit-scrollbar-track { background: hsl(var(--muted) / 0.3); border-radius: 5px; margin: 8px 0; }
        .modal-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--primary) / 0.4); border-radius: 5px; transition: background 0.2s; }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.6); }
        .modal-scrollbar { scrollbar-width: thin; scrollbar-color: hsl(var(--primary) / 0.4) hsl(var(--muted) / 0.3); }
      `}</style>

      <SeminarDetailsModal
        seminar={activeSeminar ?? undefined}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onAttend={handleAttend}
      />
    </div>
  );
}

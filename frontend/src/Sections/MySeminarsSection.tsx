import { useEffect, useState } from "react";
import MySeminarCard from "@/components/cards/MySeminarCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { MyAttendingSeminarsModal } from "@/components/overlay/MyAttendingSeminarsModal";
import { useMySeminarList } from "@/stores/SeminarStore";
import { useDeleteMySeminar, useFetchMySeminars } from "@/hooks/useMySeminar";

export default function MySeminarsSection() {
  const [showAllModal, setShowAllModal] = useState(false);
  const myAttendingSeminars = useMySeminarList().seminars
  const fetchMySeminars = useFetchMySeminars().fetchMySeminars
  const deleteMySeminar = useDeleteMySeminar().deleteMySeminar
  const removeSeminar = useMySeminarList().removeSeminar


  useEffect(() => {
    fetchMySeminars()
  }, [fetchMySeminars])

  const handleCancelAttendance = async (seminarId: number) => {
    await deleteMySeminar(seminarId)
    removeSeminar(seminarId)
  };

  return (
    <>
      <section className="w-full">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                My Seminars
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Seminars you've planned to attend
              </p>
            </div>
            {myAttendingSeminars != null && myAttendingSeminars?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllModal(true)}
                className="group hover:bg-primary/10"
              >
                View All
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>

          {/* Content */}
          {myAttendingSeminars != null && myAttendingSeminars.length > 0 ? (
            <div className="relative">
              <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
                {myAttendingSeminars.slice(0, 6).map((seminar) => (
                  <div
                    key={seminar.id}
                    className="snap-start flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-[180px]"
                  >
                    <MySeminarCard
                      seminar={seminar}
                      onCancelAttendance={handleCancelAttendance}
                    />
                  </div>
                ))}
              </div>

              {/* Gradient Fade Effect */}
              <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-sidebar/25 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-lg">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
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
              <h3 className="text-lg font-semibold mb-2">No seminars yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                you have no seminars to attend at the moment, browse the seminars list and see what you might like.
              </p>
            </div>
          )}
        </div>
      </section>
      <MyAttendingSeminarsModal
        seminars={myAttendingSeminars}
        isOpen={showAllModal}
        onClose={() => setShowAllModal(false)}
        onCancelAttendance={handleCancelAttendance}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.3);
          border-radius: 4px;
          transition: background 0.2s;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--primary) / 0.3) hsl(var(--muted));
        }
      `}</style>
    </>
  );
}
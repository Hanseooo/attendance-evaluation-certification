// src/components/sections/AttendedSeminarSection.tsx
import { useEffect, useState, useCallback } from "react";
import AttendedSeminarCard from "@/components/cards/AttendedSeminarCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type {
  AttendedSeminar,
  AttendedSeminarListResponse,
} from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import AttendedSeminarsModal from "@/components/overlay/AttendedSeminarsModal";

const BASE_API =
  "https://attendance-evaluation-certification-production.up.railway.app/api";

export default function AttendedSeminarsSection() {
  const { token } = useAuth();
  const [items, setItems] = useState<AttendedSeminar[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);


  const fetchAttended = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${BASE_API}/attendance/attended-seminars/my_attended_seminars/`,

        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as AttendedSeminarListResponse;
      setItems(data.results ?? []);
    } catch (err: any) {
      console.error("Failed to fetch attended seminars", err);
      setError(err?.message || "Failed to load attended seminars");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAttended();
  }, [fetchAttended]);

  return (
    <section className="w-full min-h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Attended Seminars
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Seminars you've completed and attended
          </p>
        </div>

        {items && items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpenModal(true)}
            className="group hover:bg-primary/10"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Loading attended seminars...
          </div>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-red-500">{error}</div>
      ) : items && items.length > 0 ? (
        <div className="relative">
          <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
            {items.slice(0, 6).map((att) => (
              <div
                key={att.id}
                className="snap-start flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-[220px]"
              >
                <AttendedSeminarCard attended={att} />
              </div>
            ))}
          </div>

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
          <h3 className="text-lg font-semibold mb-2">
            No attended seminars yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            You have not attended any seminars yet. Once you attend and complete
            a seminar it will appear here.
          </p>
        </div>
      )}
      {items && (
        <AttendedSeminarsModal
          open={openModal}
          onOpenChange={setOpenModal}
          items={items}
        />
      )}

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
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--primary) / 0.3) hsl(var(--muted));
        }
      `}</style>
    </section>
  );
}

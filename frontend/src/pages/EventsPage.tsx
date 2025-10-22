import { useEffect, useMemo } from "react";
import { useSeminarList } from "@/stores/SeminarStore";
import { useMySeminarList } from "@/stores/SeminarStore";
import { useFetchSeminars } from "@/hooks/useSeminar";
import { useFetchMySeminars } from "@/hooks/useMySeminar";
import FeaturedSeminarsSection from "@/Sections/FeaturedSeminarsSection";
import SeminarListSection from "@/Sections/SeminarListSection";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const seminars = useSeminarList((state) => state.seminar);
  const mySeminars = useMySeminarList((state) => state.seminars);
  const { fetchSeminars, loading: fetchingSeminars } = useFetchSeminars();
  const { fetchMySeminars, loading: fetchingMySeminars } = useFetchMySeminars();

  useEffect(() => {
    fetchSeminars();
    fetchMySeminars();
  }, [fetchSeminars, fetchMySeminars]);

  const filteredSeminars = useMemo(() => {
    if (!seminars) return [];
    if (!mySeminars) return seminars;
    const attendedIds = new Set(mySeminars.map((ms) => ms.seminar.id));
    return seminars.filter((s) => !attendedIds.has(s.id));
  }, [seminars, mySeminars]);


  const loading = fetchingSeminars || fetchingMySeminars;

  return (
    <div className="container p-4 sm:p-8 mx-auto space-y-6">
      {loading ? (
        <div className="space-y-10 animate-pulse">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 mx-auto sm:mx-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Show all seminars (mySeminars + upcoming) */}
          <FeaturedSeminarsSection seminars={filteredSeminars} />
          <br />
          {/* Show only unplanned seminars */}
          <SeminarListSection
            seminars={seminars}
            mySeminars={mySeminars}
            attendingIds={mySeminars?.map((m) => m.seminar.id) || []}
          />
        </>
      )}
    </div>
  );
}

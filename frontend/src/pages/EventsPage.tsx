import { useFetchSeminars } from "@/hooks/useSeminar"
import FeaturedSeminarsSection from "@/Sections/FeaturedSeminarsSection"
import SeminarListSection from "@/Sections/SeminarListSection"
import { useSeminarList } from "@/stores/SeminarStore"
import { type Seminar } from "@/utils/types"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePostMySeminar } from "@/hooks/useMySeminar"

export default function EventsPage() {
  const seminars: Seminar[] | null = useSeminarList((state) => state.seminar)
  const { fetchSeminars, loading: fetching } = useFetchSeminars()
  const postMySeminar = usePostMySeminar().postMySeminar

  const onAttend = async (id:number) => {
    postMySeminar(id)
  }

  useEffect(() => {
    fetchSeminars()
  }, [fetchSeminars])

  return (
    <div className="container p-4 sm:p-8 mx-auto space-y-6">
      {fetching ? (
        <div className="space-y-10 animate-pulse">

          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3 mx-auto sm:mx-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-xl" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-1/4 mx-auto sm:mx-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-44 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <FeaturedSeminarsSection seminars={seminars} onAttend={onAttend} />
          <br />
          <SeminarListSection seminars={seminars} onAttend={onAttend}  />
        </>
      )}
    </div>
  )
}

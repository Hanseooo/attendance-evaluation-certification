import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import blankPfp from "@/assets/images/blank-pfp.png"
import AdminSeminarCard from "@/components/cards/AdminSeminarCard"
import EditSeminarModal from "@/components/overlay/EditSeminarModal"
import CreateSeminarModal from "@/components/overlay/CreateSeminarModal"
import { type Seminar } from "@/utils/types"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useSeminarList } from "@/stores/SeminarStore"
import { useDeleteSeminar, useFetchSeminars, usePostSeminar, useUpdateSeminar } from "@/hooks/useSeminar"

export default function AdminPage() {
  const { user } = useAuth()

  // Zustand stores
  const seminars = useSeminarList((state) => state.seminar)
  const setSeminars = useSeminarList((state) => state.setSeminar)


  // Hooks for fetching and posting
  const { fetchSeminars, loading: fetching } = useFetchSeminars()
  const { postSeminar } = usePostSeminar()
  const { updateSeminar } = useUpdateSeminar()
  const { deleteSeminar } = useDeleteSeminar()

  // Local state for modals
  const [editing, setEditing] = useState<Seminar | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Seminar | null>(null)

  // Fetch seminars on mount
  useEffect(() => {
    fetchSeminars()
  }, [fetchSeminars])

  // Handle save (create or edit)
  const handleSave = async (updated: Seminar) => {
    if (creating) {
      // Add to store immediately
      setSeminars([...(seminars || []), updated])
      // Post to backend
      await postSeminar(updated)
      setCreating(false)
    } else if (editing) {
      // Update store
      setSeminars(
        (seminars || []).map((s) => (s.id === updated.id ? updated : s))
      )
      await updateSeminar(updated)
      setEditing(null)
    }
    // console.log(updated)
    fetchSeminars()
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    // Optimistically remove from store
    setSeminars((seminars || []).filter((s) => s.id !== id))
    setDeleteTarget(null)
    // Call API to delete
    await deleteSeminar(id)
  }

  const getInitials = (username: string) =>
    username
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl space-y-10">
        {/* Header Section */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-2 ring-primary/10">
              <AvatarImage src={blankPfp} alt={user?.username} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {getInitials(user?.username || "Admin")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center md:text-start">
                Welcome, {user?.username || "Admin"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1 text-center md:text-start">
                Manage upcoming seminars and events
              </p>
            </div>
            <Button
              variant="default"
              size="lg"
              className="flex items-center gap-2"
              onClick={() => setCreating(true)}
            >
              <PlusCircle className="size-5" />
              New Seminar
            </Button>
          </CardContent>
        </Card>

        {/* Seminar Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Upcoming Seminars</h2>
          {fetching ? (
            <p>Loading seminars...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {seminars?.map((s) => (
                <AdminSeminarCard
                  key={s.id}
                  seminar={s}
                  onEdit={() => setEditing(s)}
                  onDelete={() => setDeleteTarget(s)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Edit Modal */}
        <EditSeminarModal
          seminar={editing}
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />

        {/* New Seminar Modal */}
        <CreateSeminarModal
          isOpen={creating}
          onClose={() => setCreating(false)}
          onSave={handleSave}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Seminar</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4 ">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

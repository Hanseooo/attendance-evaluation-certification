import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import blankPfp from "@/assets/images/blank-pfp.png";
import AdminSeminarCard from "@/components/cards/AdminSeminarCard";
import EditSeminarModal from "@/components/overlay/EditSeminarModal";
import CreateSeminarModal from "@/components/overlay/CreateSeminarModal";
import { type Seminar } from "@/utils/types";
import { PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSeminarList } from "@/stores/SeminarStore";
import {
  useDeleteSeminar,
  useFetchSeminars,
  usePostSeminar,
  useUpdateSeminar,
} from "@/hooks/useSeminar";
import QrModal from "@/components/overlay/QrModal";
import { CertificateEditorModal } from "@/components/overlay/CertificatedEditorModal";
import { useUploadCertificateTemplate } from "@/hooks/useFetchCertificateTemplates";
import defaultCertificate from "@/assets/images/default_certificate.png";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

const PAGE_SIZE = 9;

export default function AdminPage() {
  const { user } = useAuth();

  // Zustand stores
  const seminars = useSeminarList((state) => state.seminars);
  const setSeminars = useSeminarList((state) => state.setSeminar);
  const removeSeminar = useSeminarList().removeSeminar;

  // Hooks for fetching and posting
  const { fetchSeminars, loading: fetching } = useFetchSeminars();
  const { postSeminar } = usePostSeminar();
  const { updateSeminar } = useUpdateSeminar();
  const { deleteSeminar } = useDeleteSeminar();

  // Local state for modals
  const [editing, setEditing] = useState<Seminar | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Seminar | null>(null);
  const [qrSeminar, setQrSeminar] = useState<Seminar | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showUploadCertificate, setShowUploadCertificate] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
  const { uploadTemplate } = useUploadCertificateTemplate();

  // --- UI state for All Seminars & Upcoming ---
  const [tab, setTab] = useState<"upcoming" | "all">("upcoming");
  const [query, setQuery] = useState("");
  const [filterDone, setFilterDone] = useState<"all" | "done" | "not_done">(
    "not_done"
  );
  const [sortField, setSortField] = useState<
    "date_start" | "created_at" | "duration"
  >("date_start");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // frontend pagination / infinite scroll
  const [page, setPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Fetch seminars on mount (preserve your behavior)
  useEffect(() => {
    fetchSeminars();
  }, [fetchSeminars]);

  // Reset paging when seminars / filters change
  useEffect(() => {
    setPage(1);
  }, [query, filterDone, sortField, sortDir, tab, seminars?.length]);

  // Derived filtered/sorted list (client-side)
  const filteredSeminars = useMemo(() => {
    let list = [...(seminars || [])];

    // Tab filter: upcoming = !is_done
    if (tab === "upcoming") {
      list = list.filter((s) => !s.is_done);
    }

    // filter by done status (only when in "all" tab)
    if (tab === "all") {
      if (filterDone === "done") list = list.filter((s) => s.is_done);
      else if (filterDone === "not_done") list = list.filter((s) => !s.is_done);
    }

    // search by title or speaker (case-insensitive)
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.speaker || "").toLowerCase().includes(q)
      );
    }

    // sort
    list.sort((a, b) => {
      let av: number | string = "";
      let bv: number | string = "";
      if (sortField === "date_start") {
        av = a.date_start ?? "";
        bv = b.date_start ?? "";
      } else if (sortField === "created_at") {
        av = a.created_at ?? "";
        bv = b.created_at ?? "";
      } else {
        av = a.duration_minutes ?? 0;
        bv = b.duration_minutes ?? 0;
      }

      // compare dates as strings ISO are comparable; durations as numbers
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av);
    });

    return list;
  }, [seminars, tab, query, filterDone, sortField, sortDir]);

  // paged list for rendering
  const pagedSeminars = useMemo(() => {
    const end = page * PAGE_SIZE;
    return filteredSeminars.slice(0, end);
  }, [filteredSeminars, page]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const node = loadMoreRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // if there are more items, increment page
            const maxPages = Math.ceil(filteredSeminars.length / PAGE_SIZE);
            setPage((p) => {
              if (p < maxPages) return p + 1;
              return p;
            });
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [filteredSeminars.length]);

  // Handle save (create or edit)
  const handleSave = async (updated: Seminar) => {
    if (creating) {
      setSeminars([...(seminars || []), updated]);
      await postSeminar(updated);
      setCreating(false);
    } else if (editing) {
      setSeminars(
        (seminars || []).map((s) => (s.id === updated.id ? updated : s))
      );
      await updateSeminar(updated);
      setEditing(null);
    }
    fetchSeminars();
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    setSeminars((seminars || []).filter((s) => s.id !== id));
    setDeleteTarget(null);
    await deleteSeminar(id);
    removeSeminar(id);
  };

  const getInitials = (username: string) =>
    username
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // small helper to toggle sort direction
  const toggleSortDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl space-y-8">
        {/* Header */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Avatar className="h-14 w-14 md:h-16 md:w-16 ring-2 ring-primary/10">
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
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="lg"
                className="flex items-center gap-2"
                onClick={() => setCreating(true)}
              >
                <PlusCircle className="h-5 w-5" />
                New Seminar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fetchSeminars()}
                title="Refresh seminars"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controls: Tabs + Search + Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={tab === "upcoming" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={tab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("all")}
            >
              All seminars
            </Button>
            <Badge variant="secondary" className="ml-2">
              {filteredSeminars.length} shown
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search title or speaker..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-[220px]"
            />

            {tab === "all" && (
              <Select
                value={filterDone}
                onValueChange={(v) => setFilterDone(v as any)}
              >
                <SelectTrigger className="w-40 hover:cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background ">
                  <SelectItem className="hover:cursor-pointer hover:bg-zinc-100" value="all">All</SelectItem>
                  <SelectItem className="hover:cursor-pointer hover:bg-zinc-100" value="done">Done only</SelectItem>
                  <SelectItem className="hover:cursor-pointer hover:bg-zinc-100" value="not_done">Upcoming only</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select
              value={sortField}
              onValueChange={(v) => setSortField(v as any)}
            >
              <SelectTrigger className="w-44 hover:cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background" >
                <SelectItem className="hover:bg-zinc-100 hover:cursor-pointer" value="date_start">Sort by start date</SelectItem>
                <SelectItem className="hover:bg-zinc-100 hover:cursor-pointer" value="created_at">Sort by created</SelectItem>
                <SelectItem className="hover:bg-zinc-100 hover:cursor-pointer" value="duration">Sort by duration</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={toggleSortDir}>
              {sortDir === "asc" ? "Asc" : "Desc"}
            </Button>
          </div>
        </div>

        {/* Upcoming Seminars (if tab upcoming) */}
        {tab === "upcoming" && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming Seminars</h2>
            {fetching ? (
              <p>Loading seminars...</p>
            ) : pagedSeminars.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming seminars.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {pagedSeminars.map((s) => (
                  <AdminSeminarCard
                    key={s.id}
                    seminar={s}
                    onEdit={() => setEditing(s)}
                    onDelete={() => setDeleteTarget(s)}
                    showQrModal={() => {
                      setQrSeminar(s);
                      setShowQrModal(true);
                    }}
                    onUploadCert={() => {
                      setSelectedSeminar(s);
                      setShowUploadCertificate(true);
                    }}
                  />
                ))}
              </div>
            )}
            {/* sentinel for infinite scroll */}
            <div ref={loadMoreRef} className="h-6" />
          </section>
        )}

        {/* All Seminars Section */}
        {tab === "all" && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">All Seminars</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {pagedSeminars.map((s) => (
                <AdminSeminarCard
                  key={s.id}
                  seminar={s}
                  onEdit={() => setEditing(s)}
                  onDelete={() => setDeleteTarget(s)}
                  showQrModal={() => {
                    setQrSeminar(s);
                    setShowQrModal(true);
                  }}
                  onUploadCert={() => {
                    setSelectedSeminar(s);
                    setShowUploadCertificate(true);
                  }}
                />
              ))}
            </div>

            {filteredSeminars.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No seminars found.
              </p>
            )}

            {/* sentinel for infinite scroll */}
            <div ref={loadMoreRef} className="h-6" />
          </section>
        )}

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

        {/* QR Modal */}
        <QrModal
          seminarTitle={qrSeminar?.title ?? ""}
          seminarId={qrSeminar?.id ?? 0}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />

        {/* Certificate editor */}
        <CertificateEditorModal
          isOpen={showUploadCertificate}
          onClose={() => setShowUploadCertificate(false)}
          initialSrc={defaultCertificate}
          onSave={async (coords) => {
            if (!selectedSeminar) return;
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.onchange = async (e: Event) => {
              const target = e.target as HTMLInputElement;
              const file = target.files?.[0];
              if (!file) return;

              await uploadTemplate({
                seminar: selectedSeminar.id,
                template_image: file,
                text_x: coords.x,
                text_y: coords.y,
                centered: coords.centered,
              });

              alert("Certificate template saved!");
            };

            fileInput.click();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Seminar</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget?.title}</strong>? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
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
  );
}

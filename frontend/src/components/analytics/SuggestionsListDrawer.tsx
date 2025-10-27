import { useState, useMemo, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Copy, User, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { Evaluation } from "@/utils/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  evaluations: Evaluation[];
}

export default function SuggestionsListDrawer({
  isOpen,
  onClose,
  evaluations,
}: Props) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(10);
  const perPage = 10;
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Filter logic
  const filtered = useMemo(() => {
    if (!query) return evaluations;
    const q = query.toLowerCase();
    return evaluations.filter((e) =>
      `${e.user.first_name} ${e.user.last_name} ${e.user.username} ${e.user.email} ${
        e.suggestions ?? ""
      }`
        .toLowerCase()
        .includes(q)
    );
  }, [query, evaluations]);

  // Pagination data
  const totalPages = Math.ceil(filtered.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentPageData = filtered.slice(startIndex, startIndex + perPage);
  const pageData = currentPageData.slice(0, visibleCount);

  // Infinite scroll observer
  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCount < currentPageData.length
        ) {
          setVisibleCount((prev) => prev + 5);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [currentPageData, visibleCount]);

  const copyAllNames = () => {
    navigator.clipboard.writeText(
      evaluations
        .map((e) => `${e.user.first_name} ${e.user.last_name}`)
        .join("\n")
    );
  };

  const copyAllEmails = () => {
    navigator.clipboard.writeText(
      evaluations.map((e) => e.user.email).join("\n")
    );
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setVisibleCount(10); // reset lazy load count
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-2xl rounded-2xl bg-background p-4 sm:p-6 max-h-[75vh] flex flex-col">
        {/* Header */}
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-semibold">
                Evaluator Suggestions
              </DialogTitle>
              <div className="text-sm text-muted-foreground">
                {evaluations.length} evaluator{evaluations.length !== 1 && "s"}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={copyAllNames}
                size="sm"
                className="gap-2"
              >
                <Copy className="h-4 w-4" /> Copy names
              </Button>
              <Button
                variant="outline"
                onClick={copyAllEmails}
                size="sm"
                className="gap-2"
              >
                <Copy className="h-4 w-4" /> Copy emails
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-3" />

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search name, email, or suggestion..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
              setVisibleCount(10);
            }}
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Scrollable List */}
        <ScrollArea className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3 pb-4">
            {pageData.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-4 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary shrink-0">
                      <User className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                        <div className="truncate">
                          <div className="font-medium leading-tight truncate">
                            {e.user.first_name} {e.user.last_name}{" "}
                            <span className="text-xs text-muted-foreground">
                              ({e.user.username})
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {e.user.email}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-primary shrink-0">
                          {e.overall_satisfaction}/5
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-muted-foreground break-words leading-snug">
                        {e.suggestions ? (
                          e.suggestions
                        ) : (
                          <span className="italic text-muted-foreground/80">
                            No comment provided
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No evaluators found.
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            {pageData.length < currentPageData.length && (
              <div
                ref={observerRef}
                className="h-8 flex justify-center items-center text-xs text-muted-foreground"
              >
                Loading more...
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center py-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size="sm"
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    className={
                      currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <Button
                      size="sm"
                      variant={currentPage === i + 1 ? "default" : "ghost"}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  </PaginationItem>
                ))}

                {totalPages > 5 && <PaginationEllipsis />}

                <PaginationItem>
                  <PaginationNext
                    size="sm"
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

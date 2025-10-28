"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEvaluationApi } from "@/hooks/useEvaluationApi";
import EvaluationCard from "@/components/cards/EvaluationCard";
import {
  type Evaluation,
  type Seminar,
  type EvaluationPayload,
} from "@/utils/types";
import { EvaluationModal } from "@/components/overlay/EvaluationModal";
import { CertificateModal } from "@/components/overlay/CertificateModal";
import { toast } from "sonner";

export default function FeedbackPage() {
  const { getAvailableEvaluations, submitEvaluationWithCertificate } =
    useEvaluationApi();

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // local loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAvailableEvaluations();
      setEvaluations(data);
    } catch (err) {
      console.error("Failed to fetch evaluations", err);
      setError("Unable to load your evaluations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (payload: EvaluationPayload) => {
  try {
    const response = await submitEvaluationWithCertificate(payload);

    setEvaluations((prev) =>
      prev.filter((ev) => ev.seminar.id !== payload.seminar_id)
    );

    if (response?.certificate_url) {
      setCertificateUrl(response.certificate_url);
      setShowCertificateModal(true);
    } else {
      setShowModal(false);
      setSelectedSeminar(null);
    }

    toast.success("Evaluation submitted successfully!");
  } catch (err) {
    console.error("Submission failed", err);
    toast.error("Failed to submit evaluation. Please try again.");
  }
};


  useEffect(() => {
    fetchEvaluations();
  }, []);

  // skeleton placeholders count
  const skeletonCount = 6;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header Section */}
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="p-6 md:p-8 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Seminar Feedback
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Complete your evaluations for attended seminars
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Inline error display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 mb-6 text-destructive text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchEvaluations}>
              Retry
            </Button>
          </div>
        )}

        {/* Evaluation Cards Section */}
        <div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 border border-border/40 rounded-lg animate-pulse bg-muted/10"
                >
                  <div className="h-5 bg-muted/30 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-muted/20 rounded w-full mb-2" />
                  <div className="h-3 bg-muted/20 rounded w-5/6 mb-4" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-muted/20 rounded" />
                    <div className="w-24 h-8 bg-muted/20 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : evaluations.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {evaluations.map((evalItem) => (
                <EvaluationCard
                  key={evalItem.id ?? `${evalItem.seminar.id}`}
                  seminar={evalItem.seminar}
                  onOpen={() => {
                    setSelectedSeminar(evalItem.seminar);
                    setShowModal(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No Evaluations Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                You currently have no pending seminar evaluations to complete.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedSeminar && (
        <EvaluationModal
          seminar={selectedSeminar}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSeminar(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {showCertificateModal && certificateUrl && (
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => {
            setShowCertificateModal(false);
            setCertificateUrl(null);
          }}
          certificateUrl={certificateUrl}
          seminarTitle={selectedSeminar?.title ?? "Seminar Certificate"}
          seminarId={selectedSeminar?.id ?? 0}
        />
      )}
    </div>
  );
}

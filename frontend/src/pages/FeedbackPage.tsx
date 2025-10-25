import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEvaluationApi } from "@/hooks/useEvaluationApi";
import EvaluationCard from "@/components/cards/EvaluationCard";
import {
  type Evaluation,
  type Seminar,
  type EvaluationPayload,
} from "@/utils/types";
import { EvaluationModal } from "@/components/overlay/EvaluationModal";
import { CertificateModal } from "@/components/overlay/CertificateModal";

export default function FeedbackPage() {
  const { getAvailableEvaluations, submitEvaluationWithCertificate } =
    useEvaluationApi();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const fetchEvaluations = async () => {
    const { data } = await getAvailableEvaluations();
    setEvaluations(data);
  };


  const handleSubmit = async (payload: EvaluationPayload) => {
    const response = await submitEvaluationWithCertificate(payload);

    if (response?.certificate_url) {
      setCertificateUrl(response.certificate_url);
      setShowCertificateModal(true);
    }

    await fetchEvaluations();
    setShowModal(false);
  };

  useEffect(() => {
    fetchEvaluations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ run only once on mount

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

        {/* Evaluation Cards Section */}
        <div>
          {evaluations.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {evaluations.map((evalItem) => (
                <EvaluationCard
                  key={evalItem.id}
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
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showCertificateModal && certificateUrl && selectedSeminar && (
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          certificateUrl={certificateUrl}
          seminarTitle={selectedSeminar.title}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { type Seminar, type EvaluationPayload } from "@/utils/types";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

interface EvaluationModalProps {
  seminar: Seminar;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: EvaluationPayload) => Promise<void>;
}

export function EvaluationModal({
  seminar,
  isOpen,
  onClose,
  onSubmit,
}: EvaluationModalProps) {
  const initialForm: EvaluationPayload = {
    seminar_id: seminar.id,
    content_and_relevance: 3,
    presenters_effectiveness: 3,
    organization_and_structure: 3,
    materials_usefulness: 3,
    overall_satisfaction: 3,
    suggestions: "",
  };

  const [form, setForm] = useState<EvaluationPayload>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // reset form when seminar changes
  useEffect(() => {
    setForm({
      ...initialForm,
      seminar_id: seminar.id,
    });
    setErrors({});
  }, [seminar]);

  const handleChange = (
    field: keyof EvaluationPayload,
    value: number | string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const ratingFields = [
      "content_and_relevance",
      "presenters_effectiveness",
      "organization_and_structure",
      "materials_usefulness",
      "overall_satisfaction",
    ];
    for (const field of ratingFields) {
      if (!(form as any)[field]) newErrors[field] = "Please select a rating.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      toast.success("Evaluation submitted successfully!");
      onClose();
    } catch (err) {
      console.error("Evaluation submit failed", err);
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const ratingFields = [
    ["content_and_relevance", "Content & Relevance"],
    ["presenters_effectiveness", "Presenter's Effectiveness"],
    ["organization_and_structure", "Organization & Structure"],
    ["materials_usefulness", "Usefulness of Materials"],
    ["overall_satisfaction", "Overall Satisfaction"],
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] md:w-full rounded-2xl overflow-y-auto max-h-[90vh]  backdrop-blur-md border border-border/40 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Evaluation — {seminar.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Please rate each aspect of this seminar
          </p>
        </DialogHeader>

        <div className="space-y-5 mt-5">
          {ratingFields.map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Label className="font-medium">{label}</Label>
              <Select
                value={(form as any)[key].toString()}
                onValueChange={(v) => handleChange(key, Number(v))}
              >
                <SelectTrigger className="w-full bg-background border-border/50 focus:ring-2 focus:ring-primary/30">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border border-border/30 rounded-lg shadow-md">
                  <SelectItem value="1">1 — Very Poor</SelectItem>
                  <SelectItem value="2">2 — Poor</SelectItem>
                  <SelectItem value="3">3 — Fair</SelectItem>
                  <SelectItem value="4">4 — Good</SelectItem>
                  <SelectItem value="5">5 — Excellent</SelectItem>
                </SelectContent>
              </Select>
              {errors[key] && (
                <p className="text-destructive text-xs mt-1">{errors[key]}</p>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <Label>Suggestions for Improvement (optional)</Label>
            <Textarea
              placeholder="Write your comments..."
              value={form.suggestions}
              onChange={(e) => handleChange("suggestions", e.target.value)}
              className="resize-none h-24 bg-background border-border/50 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full text-base font-semibold mt-3 shadow-sm hover:shadow-md transition-all"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </span>
            ) : (
              "Submit Evaluation"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

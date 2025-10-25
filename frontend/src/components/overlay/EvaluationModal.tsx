import { useState } from "react";
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
  const [form, setForm] = useState<EvaluationPayload>({
    seminar_id: seminar.id,
    content_and_relevance: 3,
    presenters_effectiveness: 3,
    organization_and_structure: 3,
    materials_usefulness: 3,
    overall_satisfaction: 3,
    suggestions: "",
  });

  const handleChange = (
    field: keyof EvaluationPayload,
    value: number | string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(form);
    onClose();
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
      <DialogContent className="max-w-lg rounded-2xl overflow-y-auto custom-scrollbar max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Evaluation — {seminar.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {ratingFields.map(([key, label]) => (
            <div key={key} className="flex flex-col gap-2">
              <Label>{label}</Label>
              <Select
                value={form[key].toString()}
                onValueChange={(v) => handleChange(key, Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md rounded-lg border border-border/40 shadow-md">
                  <SelectItem value="1">1 — Very Poor</SelectItem>
                  <SelectItem value="2">2 — Poor</SelectItem>
                  <SelectItem value="3">3 — Fair</SelectItem>
                  <SelectItem value="4">4 — Good</SelectItem>
                  <SelectItem value="5">5 — Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="flex flex-col gap-2">
            <Label>Suggestions for Improvement</Label>
            <Textarea
              placeholder="Write your comments..."
              value={form.suggestions}
              onChange={(e) => handleChange("suggestions", e.target.value)}
              className="resize-none h-24"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full text-base font-medium mt-2"
          >
            Submit Evaluation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

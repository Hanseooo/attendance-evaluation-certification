// src/components/analytics/RatingsSummary.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Props {
  averages: {
    content_and_relevance: number;
    presenters_effectiveness: number;
    organization_structure: number;
    materials_usefulness: number;
    overall_satisfaction: number;
  };
}

const rows = [
  { key: "content_and_relevance", label: "Content & Relevance" },
  { key: "presenters_effectiveness", label: "Presenter Effectiveness" },
  { key: "organization_structure", label: "Organization & Structure" },
  { key: "materials_usefulness", label: "Usefulness of Materials" },
  { key: "overall_satisfaction", label: "Overall Satisfaction" },
] as const;

export default function RatingsSummary({ averages }: Props) {
  const overall =
    (averages.content_and_relevance +
      averages.presenters_effectiveness +
      averages.organization_structure +
      averages.materials_usefulness +
      averages.overall_satisfaction) /
    5;

  return (
    <div className="space-y-4">
      {/* Overall average card */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Overall Average
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Average rating</p>
            <p className="text-3xl font-bold tracking-tight">
              {overall.toFixed(2)}
            </p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Star className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Individual categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/30"
          >
            <span className="text-xs sm:text-sm font-medium truncate pr-2">
              {r.label}
            </span>
            <span className="text-sm sm:text-base font-semibold">
              {(averages as any)[r.key].toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

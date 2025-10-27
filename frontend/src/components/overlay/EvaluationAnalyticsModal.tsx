import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  BarChart as IconBar,
  PieChart as IconPie,
  Radar as IconRadar,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { useSeminarAnalytics } from "@/hooks/useSeminarAnalytics";
import ChartSwitcher from "@/components/analytics/ChartSwitcher";
import RatingsSummary from "@/components/analytics/RatingsSummary";
import SuggestionsListDrawer from "@/components/analytics/SuggestionsListDrawer";

interface Props {
  seminarId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

type CategoryKey =
  | "all"
  | "content_and_relevance"
  | "presenters_effectiveness"
  | "organization_and_structure"
  | "materials_usefulness"
  | "overall_satisfaction";

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  all: "All",
  content_and_relevance: "Content & Relevance",
  presenters_effectiveness: "Presenter Effectiveness",
  organization_and_structure: "Organization & Structure",
  materials_usefulness: "Usefulness of Materials",
  overall_satisfaction: "Overall Satisfaction",
};

export default function EvaluationAnalyticsModal({
  seminarId,
  isOpen,
  onClose,
}: Props) {
  const { data, loading, error } = useSeminarAnalytics(seminarId);
  const [chartType, setChartType] = useState<"bar" | "pie" | "radar">("bar");
  const [category, setCategory] = useState<CategoryKey>("all");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { averages, labels, series } = useMemo(() => {
    const out = {
      averages: {
        content_and_relevance: 0,
        presenters_effectiveness: 0,
        organization_structure: 0,
        materials_usefulness: 0,
        overall_satisfaction: 0,
      },
      labels: [] as string[],
      series: [] as number[],
    };

    if (!data?.evaluations?.length) return out;

    const counts = data.evaluations.length;
    const totals = {
      content_and_relevance: 0,
      presenters_effectiveness: 0,
      organization_structure: 0,
      materials_usefulness: 0,
      overall_satisfaction: 0,
    };

    data.evaluations.forEach((e) => {
      totals.content_and_relevance += e.content_and_relevance;
      totals.presenters_effectiveness += e.presenters_effectiveness;
      totals.organization_structure += e.organization_and_structure;
      totals.materials_usefulness += e.materials_usefulness;
      totals.overall_satisfaction += e.overall_satisfaction;
    });

    Object.keys(totals).forEach((key) => {
      // @ts-ignore
      out.averages[key] = +(totals[key] / counts).toFixed(2);
    });

    out.labels = [
      "Content & Relevance",
      "Presenter Effectiveness",
      "Organization & Structure",
      "Usefulness of Materials",
      "Overall Satisfaction",
    ];

    out.series = Object.values(out.averages);

    return out;
  }, [data]);

  if (!seminarId) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="
            w-[95vw] max-w-5xl mx-auto 
            rounded-2xl bg-background 
            p-4 sm:p-6 
            overflow-y-auto 
            max-h-[90vh]
            space-y-4"
        >
          {/* Header */}
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-semibold">
                  {data?.seminar_title ?? "Seminar Analytics"}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {data
                    ? `${data.total_responses} response${data.total_responses !== 1 ? "s" : ""}`
                    : "No responses yet"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {data?.total_responses ?? 0} responses
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowSuggestions(true)}
                >
                  <MessageSquare className="h-4 w-4" /> Suggestions
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setChartType("bar");
                    setCategory("all");
                  }}
                  title="Reset filters"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <Separator className="my-4" />

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side Controls */}
            <div className="lg:col-span-1 space-y-6">
              <RatingsSummary averages={averages} />

              {/* Category Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Category
                </label>
                <Select
                  onValueChange={(v) => setCategory(v as CategoryKey)}
                  value={category}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <>
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                        <Separator />
                      </>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chart Type Buttons */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Chart Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    onClick={() => setChartType("bar")}
                    className="gap-2 flex-1"
                  >
                    <IconBar className="h-4 w-4" /> Bar
                  </Button>
                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    onClick={() => setChartType("pie")}
                    className="gap-2 flex-1"
                  >
                    <IconPie className="h-4 w-4" /> Pie
                  </Button>
                  <Button
                    variant={chartType === "radar" ? "default" : "outline"}
                    onClick={() => setChartType("radar")}
                    className="gap-2 flex-1"
                  >
                    <IconRadar className="h-4 w-4" /> Radar
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side Chart */}
            <div className="lg:col-span-2">
              <Card className="h-full border border-border/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Ratings Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex items-center justify-center">
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
                    </div>
                  ) : error ? (
                    <p className="py-8 text-sm text-center text-destructive">
                      {error}
                    </p>
                  ) : !data?.evaluations?.length ? (
                    <p className="py-8 text-sm text-center text-muted-foreground">
                      No evaluation data to display.
                    </p>
                  ) : (
                    <div className="h-80 w-full">
                      <ChartSwitcher
                        chartType={chartType}
                        category={category}
                        analytics={data}
                        labels={labels}
                        series={series}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suggestions Drawer */}
      <SuggestionsListDrawer
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        evaluations={data?.evaluations ?? []}
      />
    </>
  );
}

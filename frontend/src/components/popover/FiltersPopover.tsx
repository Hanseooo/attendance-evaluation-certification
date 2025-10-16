import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export type SortDirection = "asc" | "desc";
export type SortField = "date" | "duration";

export type Filters = {
  sortField: SortField;
  sortDir: SortDirection;
  hideAttending: boolean;
};

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
};

export default function FiltersPopover({ value, onChange }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-4 z-10 bg-background">
        <div className="space-y-4">
          {/* Sort Section */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Sort by
            </p>

            <div className="mt-3 space-y-3">
              {/* Sort by Date */}
              <div>
                <p className="text-sm font-semibold mb-1">Date</p>
                <RadioGroup
                  value={value.sortField === "date" ? value.sortDir : ""}
                  onValueChange={(v) =>
                    onChange({ ...value, sortField: "date", sortDir: v as SortDirection })
                  }
                  className="flex gap-3"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="asc" />
                    Nearest
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="desc" />
                    Farthest
                  </label>
                </RadioGroup>
              </div>

              {/* Sort by Duration */}
              <div>
                <p className="text-sm font-semibold mb-1">Duration</p>
                <RadioGroup
                  value={value.sortField === "duration" ? value.sortDir : ""}
                  onValueChange={(v) =>
                    onChange({ ...value, sortField: "duration", sortDir: v as SortDirection })
                  }
                  className="flex gap-3"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="asc" />
                    Short
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="desc" />
                    Long
                  </label>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Hide Attending */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium">Hide seminars I'm attending</p>
              <p className="text-xs text-muted-foreground">
                Hide upcoming seminars that you're already attending
              </p>
            </div>
            <Switch
              checked={value.hideAttending}
              onCheckedChange={(v) =>
                onChange({ ...value, hideAttending: Boolean(v) })
              }
            />
          </div>

          {/* Reset */}
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onChange({
                  sortField: "date",
                  sortDir: "asc",
                  hideAttending: true,
                })
              }
            >
              Reset
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

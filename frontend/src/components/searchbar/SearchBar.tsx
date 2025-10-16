"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = "Search seminars...",
  onSearch,
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "relative flex items-center w-full max-w-lg",
        "rounded-lg border border-border bg-muted/50",
        "transition-all duration-200 hover:bg-muted/70 focus-within:bg-background",
        "shadow-sm focus-within:shadow-md",
        className
      )}
    >
      {/* Icon */}
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />

      {/* Input */}
      <input
        type="text"
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) {
            onSearch(e.currentTarget.value);
          }
        }}
        className={cn(
          "w-full rounded-lg bg-transparent pl-9 pr-4 py-2.5 text-sm",
          "placeholder:text-muted-foreground/70 text-foreground outline-none",
          "transition-colors duration-200"
        )}
      />
    </div>
  );
}

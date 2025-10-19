import { useState } from "react";
import { ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface UrlDisplayProps {
  url: string;
}

export default function UrlDisplay({ url }: UrlDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full bg-gray-50 border border-border rounded-md px-2 py-1 text-xs text-muted-foreground">
          {/* URL Container */}
          <div
            className={`w-full sm:flex-1 ${
              expanded
                ? "break-all max-w-full"
                : "truncate max-w-[120px] sm:max-w-[200px]"
            }`}
          >
            <span title={url} className="inline-block w-full">
              {url}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-1 mt-1 sm:mt-0 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="p-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "−" : "…"}
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1"
                  onClick={handleCopy}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {copied ? "Copied!" : "Copy URL"}
              </TooltipContent>
            </Tooltip>

            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

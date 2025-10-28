import { useState } from "react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface UrlDisplayProps {
  url: string;
}

export default function UrlDisplay({ url }: UrlDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Failed to copy URL");
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full bg-card text-card-foreground border border-border rounded-md px-3 py-2 text-xs transition-colors duration-200">
          {/* === URL Container === */}
          <div
            className={`w-full sm:flex-1 ${
              expanded
                ? "break-all max-w-full"
                : "truncate max-w-[140px] sm:max-w-[240px]"
            }`}
          >
            <span title={url} className="inline-block w-full select-text">
              {url}
            </span>
          </div>

          {/* === Buttons === */}
          <div className="flex items-center gap-1 mt-1 sm:mt-0 flex-shrink-0">
            {/* Expand/Collapse Button */}
            <Button
              variant="ghost"
              size="icon"
              className="p-1 hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? "−" : "…"}
            </Button>

            {/* Copy Button with Animation */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className={`p-1 transition-all relative ${
                    copied
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Copy URL"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-popover text-popover-foreground border border-border px-2 py-1 text-xs rounded-md shadow-sm"
              >
                {copied ? "Copied!" : "Copy URL"}
              </TooltipContent>
            </Tooltip>

            {/* External Link Button */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open link in new tab"
              className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

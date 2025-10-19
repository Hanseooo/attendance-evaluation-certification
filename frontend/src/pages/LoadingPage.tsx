import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";


export default function LoadingPage() {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-center">
        <Card className="w-[320px] shadow-md border-border/40">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-5">
            {/* Animated logo circle */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="relative rounded-full bg-primary/10 p-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>

            {/* App name or message */}
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Loading your experience...
            </h2>

            {/* Progress shimmer bar */}
            <div className="w-40 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary animate-[loadbar_1.5s_ease-in-out_infinite]" />
            </div>

            {/* Subtle skeleton rows to simulate content */}
            <div className="w-full mt-6 space-y-2">
              <Skeleton className="h-3 w-3/4 mx-auto" />
              <Skeleton className="h-3 w-2/3 mx-auto" />
              <Skeleton className="h-3 w-1/2 mx-auto" />
            </div>
          </CardContent>
        </Card>

        <style>{`
          @keyframes loadbar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
}
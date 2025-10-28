import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateUrl: string;
  seminarTitle: string;
  seminarId: number;
}

export function CertificateModal({
  isOpen,
  onClose,
  certificateUrl,
  seminarTitle,
}: CertificateModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { user } = useAuth();
  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : "Participant";



  const handleDownload = async () => {
    try {
      setDownloading(true);

      // For base64 data URLs
      const fileName = `${seminarTitle.replace(/\s+/g, "_")}_Certificate.png`;
      const a = document.createElement("a");
      a.href = certificateUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error downloading certificate:", error);
    } finally {
      setDownloading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] border-2 border-primary/20 shadow-2xl rounded-2xl overflow-hidden p-4 sm:p-6">
        {/* Header */}
        <DialogHeader className="relative pb-3 sm:pb-4 border-b border-border/50">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="flex-shrink-0"
              >
                <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </motion.div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Certificate Generated!
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                  Congratulations, {fullName}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Certificate Display */}
        <div className="py-4 sm:py-6 px-1 sm:px-2 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(95vh-220px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* Loading State */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/10 rounded-xl z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Loading certificate...
                  </p>
                </div>
              </div>
            )}

            {/* Certificate Image */}
            <div className="bg-zinc-100 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-border/30 sm:border-2 shadow-lg overflow-hidden">
              <img
                src={certificateUrl}
                alt="Certificate of Attendance"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-auto rounded-md sm:rounded-lg shadow-lg sm:shadow-xl transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 sm:mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3"
          >
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm min-w-0">
              <p className="font-medium text-blue-700 dark:text-blue-400">
                Certificate Sent!
              </p>
              <p className="text-muted-foreground mt-1">
                A copy has been sent to your email address. You can also
                download it below.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:flex-1 border-border/50 hover:bg-muted text-sm"
          >
            Close
          </Button>

          <Button
            onClick={handleDownload}
            disabled={downloading || !imageLoaded}
            className="w-full sm:flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all text-sm"
          >
            {downloading ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Download Certificate
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

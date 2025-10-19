import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGenerateQrCode } from "@/hooks/useGenerateQrCode";
import { useDownloadQr } from "@/hooks/useDownloadQr";
import UrlDisplay from "../other/UrlDisplay";

interface QrData {
  qr_image: string;
  url: string;
  download_url?: string;
}

interface QrResponse {
  check_in: QrData;
  check_out: QrData;
}

interface QrModalProps {
  seminarId: number;
  seminarTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrModal({
  seminarId,
  seminarTitle,
  isOpen,
  onClose,
}: QrModalProps) {
  const { generateQrCodes } = useGenerateQrCode();
  const { downloadQr } = useDownloadQr();

  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<QrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Load cached QR codes on open
  useEffect(() => {
    if (isOpen) {
      const cached = localStorage.getItem(`qrData_${seminarId}`);
      if (cached) {
        try {
          setQrData(JSON.parse(cached));
        } catch {
          localStorage.removeItem(`qrData_${seminarId}`);
        }
      }
    }
  }, [isOpen, seminarId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateQrCodes(seminarId);
      setQrData(data);

      // ✅ Cache result for future modal opens
      localStorage.setItem(`qrData_${seminarId}`, JSON.stringify(data));
    } catch (err) {
      console.error("QR generation failed:", err);
      setError("Failed to generate QR codes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem(`qrData_${seminarId}`);
    setQrData(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl shadow-2xl p-6 bg-background border border-border">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {seminarTitle}
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            QR Codes for attendance
          </p>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5">
          {!qrData && !loading && (
            <Button onClick={handleGenerate} className="w-full font-medium">
              Generate QR Codes
            </Button>
          )}

          {loading && (
            <div className="text-sm text-muted-foreground animate-pulse">
              Generating QR codes...
            </div>
          )}

          {error && <div className="text-destructive text-sm">{error}</div>}

          {qrData && (
            <>
              <div className="w-full grid sm:grid-cols-2 gap-6">
                {/* Check-In */}
                <div className="flex flex-col items-center gap-3 border rounded-xl p-4 bg-card">
                  <h3 className="font-medium text-gray-700">Check-In</h3>
                  <img
                    src={qrData.check_in.qr_image}
                    alt="Check-in QR"
                    className="w-44 h-44 object-contain border rounded-lg"
                  />
                  <UrlDisplay url={qrData.check_in.url} />
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      downloadQr(
                        qrData.check_in.qr_image,
                        `${seminarTitle}_Check-In`
                      )
                    }
                  >
                    Download QR
                  </Button>
                </div>

                {/* Check-Out */}
                <div className="flex flex-col items-center gap-3 border rounded-xl p-4 bg-card">
                  <h3 className="font-medium text-gray-700">Check-Out</h3>
                  <img
                    src={qrData.check_out.qr_image}
                    alt="Check-out QR"
                    className="w-44 h-44 object-contain border rounded-lg"
                  />
                  <UrlDisplay url={qrData.check_out.url} />
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      downloadQr(
                        qrData.check_out.qr_image,
                        `${seminarTitle}_Check-Out`
                      )
                    }
                  >
                    Download QR
                  </Button>
                </div>
              </div>

              {/* 🔄 Optional clear cache button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                className="mt-4"
              >
                Regenerate QR Codes
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

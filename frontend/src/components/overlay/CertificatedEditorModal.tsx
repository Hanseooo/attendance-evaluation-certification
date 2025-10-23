import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, Move } from "lucide-react";
import { useDropzone } from "react-dropzone";
import clsx from "clsx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialSrc?: string;
  previewName?: string;
  onSave: (coords: { x: number; y: number; centered: boolean }) => void;
}

export function CertificateEditorModal({
  isOpen,
  onClose,
  initialSrc,
  previewName = "John Doe",
  onSave,
}: Props) {
  const [src, setSrc] = useState<string | undefined>(initialSrc);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 }); // % position
  const draggingRef = useRef(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Dropzone for image upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setSrc(reader.result as string);
      reader.readAsDataURL(file);
      setPos({ x: 50, y: 50 }); // reset text position
    },
  });

  // Drag handlers
  useEffect(() => {
    const handleDrag = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current || !imgRef.current) return;

      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY =
        "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const left = ((clientX - rect.left) / rect.width) * 100;
      const top = ((clientY - rect.top) / rect.height) * 100;

      setPos({
        x: Math.max(0, Math.min(100, left)),
        y: Math.max(0, Math.min(100, top)),
      });
    };

    const stopDrag = () => {
      draggingRef.current = false;
    };

    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("touchmove", handleDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("touchmove", handleDrag);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchend", stopDrag);
    };
  }, []);

  // Compute absolute coordinates in pixels
  const computeAbsolute = () => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const { naturalWidth, naturalHeight } = imgRef.current;
    return {
      x: Math.round((pos.x / 100) * naturalWidth),
      y: Math.round((pos.y / 100) * naturalHeight),
    };
  };

  // Reset image on modal close
  useEffect(() => {
    if (!isOpen) {
      setSrc(initialSrc);
      setPos({ x: 50, y: 50 });
      setImgLoaded(false);
    }
  }, [isOpen, initialSrc]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] rounded-xl shadow-lg p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold">
            Certificate Template Editor
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Upload a certificate image and position the text placeholder
          </DialogDescription>
        </DialogHeader>

        {/* Upload */}
        {!src && (
          <div
            {...getRootProps()}
            className={clsx(
              "flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition cursor-pointer",
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/20 hover:border-primary/40"
            )}
          >
            <input {...getInputProps()} />
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-center text-sm text-muted-foreground">
              {isDragActive
                ? "Drop your certificate template here"
                : "Drag & drop a certificate template or click to upload"}
            </p>
            <Button variant="outline" className="mt-4 gap-2">
              <Upload className="h-4 w-4" /> Choose File
            </Button>
          </div>
        )}

        {/* Editor */}
        {src && (
          <div className="flex flex-col space-y-4">
            <div className="relative w-full flex justify-center items-center overflow-hidden rounded-xl border bg-muted shadow-sm max-h-[70vh] p-4">
              <img
                ref={imgRef}
                src={src}
                alt="Template"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                onLoad={() => setImgLoaded(true)}
              />

              {imgLoaded && (
                <div
                  onMouseDown={() => (draggingRef.current = true)}
                  onTouchStart={() => (draggingRef.current = true)}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="absolute bg-primary/15 border border-primary text-primary rounded-lg cursor-grab px-4 py-1 text-sm font-medium flex items-center gap-2 select-none"
                >
                  <Move className="h-3 w-3 opacity-70" />
                  {previewName}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="text-sm text-muted-foreground">
                Position: {pos.x.toFixed(1)}%, {pos.y.toFixed(1)}%
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setSrc(undefined)}
                  className="text-sm"
                >
                  Change Template
                </Button>
                <Button
                  onClick={() => {
                    const abs = computeAbsolute();
                    onSave({ x: abs.x, y: abs.y, centered: true });
                  }}
                  className="text-sm"
                >
                  Save Position
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// src/components/overlay/CertificateEditorModal.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, ImageIcon, Save, AlertCircle, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import clsx from "clsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type CertificateTemplate, type FontOption } from "@/utils/types";

interface TextElement {
  id: "name" | "title";
  text: string;
  xPercent: number;
  yPercent: number;
  fontSize: number;
  font: string;
  color: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  seminarId: number;
  seminarTitle: string;
  initialTemplate?: CertificateTemplate | null;
  onSave: (template: CertificateTemplate) => Promise<void>;
}

const AVAILABLE_FONTS: FontOption[] = [
  { value: "arial.ttf", label: "Arial" },
  { value: "times.ttf", label: "Times New Roman" },
  { value: "cour.ttf", label: "Courier New" },
  { value: "verdana.ttf", label: "Verdana" },
  { value: "georgia.ttf", label: "Georgia" },
];

export function CertificateEditorModal({
  isOpen,
  onClose,
  seminarId,
  seminarTitle,
  initialTemplate,
  onSave,
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Image dimensions
  const [imgNaturalWidth, setImgNaturalWidth] = useState(2000);
  const [imgNaturalHeight, setImgNaturalHeight] = useState(1414);

  // Text elements
  const [nameElement, setNameElement] = useState<TextElement>({
    id: "name",
    text: "Participant Name",
    xPercent: 50,
    yPercent: 44.2,
    fontSize: 128,
    font: "arial.ttf",
    color: "#000000",
  });

  const [titleElement, setTitleElement] = useState<TextElement>({
    id: "title",
    text: seminarTitle,
    xPercent: 50,
    yPercent: 63.6,
    fontSize: 80,
    font: "arial.ttf",
    color: "#1a1a1a",
  });

  const [activeElement, setActiveElement] = useState<"name" | "title" | null>(
    null
  );
  const draggingRef = useRef<"name" | "title" | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load initial template data
  useEffect(() => {
    if (initialTemplate) {
      setImageSrc(initialTemplate.template_image_url || undefined);
      setImgNaturalWidth(initialTemplate.template_width);
      setImgNaturalHeight(initialTemplate.template_height);

      setNameElement({
        id: "name",
        text: "Participant Name",
        xPercent: initialTemplate.name_x_percent,
        yPercent: initialTemplate.name_y_percent,
        fontSize: initialTemplate.name_font_size,
        font: initialTemplate.name_font,
        color: initialTemplate.name_color,
      });

      setTitleElement({
        id: "title",
        text: seminarTitle,
        xPercent: initialTemplate.title_x_percent,
        yPercent: initialTemplate.title_y_percent,
        fontSize: initialTemplate.title_font_size,
        font: initialTemplate.title_font,
        color: initialTemplate.title_color,
      });
    }
  }, [initialTemplate, seminarTitle]);

  // Dropzone for image upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          setImgNaturalWidth(img.width);
          setImgNaturalHeight(img.height);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
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

      // Calculate percentage position
      const xPercent = Math.max(
        5,
        Math.min(95, ((clientX - rect.left) / rect.width) * 100)
      );
      const yPercent = Math.max(
        5,
        Math.min(95, ((clientY - rect.top) / rect.height) * 100)
      );

      if (draggingRef.current === "name") {
        setNameElement((prev) => ({
          ...prev,
          xPercent,
          yPercent,
        }));
      } else if (draggingRef.current === "title") {
        setTitleElement((prev) => ({
          ...prev,
          xPercent,
          yPercent,
        }));
      }
    };

    const stopDrag = () => {
      draggingRef.current = null;
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

  // Calculate scaled font size for preview
  const getScaledFontSize = useCallback(
    (originalSize: number) => {
      if (!imgRef.current) return originalSize;
      const scale = imgRef.current.width / imgNaturalWidth;
      return Math.max(8, originalSize * scale);
    },
    [imgNaturalWidth]
  );

  // Handle save
  const handleSave = async () => {
    if (!imageSrc) {
      alert("Please upload an image first");
      return;
    }

    setSaving(true);
    try {
      const template: CertificateTemplate = {
        seminar_id: seminarId,
        template_image: imageFile,
        template_image_url: imageSrc,
        template_width: imgNaturalWidth,
        template_height: imgNaturalHeight,

        // Name settings
        name_x_percent: nameElement.xPercent,
        name_y_percent: nameElement.yPercent,
        name_font_size: nameElement.fontSize,
        name_font: nameElement.font,
        name_color: nameElement.color,

        // Title settings
        title_x_percent: titleElement.xPercent,
        title_y_percent: titleElement.yPercent,
        title_font_size: titleElement.fontSize,
        title_font: titleElement.font,
        title_color: titleElement.color,
      };

      await onSave(template);
      onClose();
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Reset on modal close
  useEffect(() => {
    if (!isOpen) {
      setImgLoaded(false);
      setActiveElement(null);
      setSaving(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[98vh] overflow-y-auto rounded-xl shadow-lg p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl font-semibold">
            Certificate Template Editor
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {seminarTitle}
          </DialogDescription>
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs sm:text-sm text-blue-800">
              Note: Font rendering is approximate. The final certificate may
              have slight differences.
            </AlertDescription>
          </Alert>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
          {/* Left: Editor Canvas */}
          <div className="lg:col-span-2 space-y-4">
            {!imageSrc && (
              <div
                {...getRootProps()}
                className={clsx(
                  "flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-2xl transition cursor-pointer min-h-[300px]",
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/20 hover:border-primary/40"
                )}
              >
                <input {...getInputProps()} />
                <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                <p className="text-center text-sm sm:text-base text-muted-foreground mb-2">
                  {isDragActive
                    ? "Drop your certificate template here"
                    : "Drag & drop a certificate template or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Recommended: 2000×1414 pixels
                </p>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" /> Choose File
                </Button>
              </div>
            )}

            {imageSrc && (
              <div className="space-y-3">
                {/* Image info */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground px-2">
                  <span>
                    Original: {imgNaturalWidth}×{imgNaturalHeight}px
                  </span>
                  {imgRef.current && (
                    <span>
                      Preview: {Math.round(imgRef.current.width)}×
                      {Math.round(imgRef.current.height)}px (
                      {Math.round(
                        (imgRef.current.width / imgNaturalWidth) * 100
                      )}
                      %)
                    </span>
                  )}
                </div>

                {/* Canvas */}
                <div className="relative w-full flex justify-center items-center overflow-hidden rounded-xl border-2 border-border bg-muted/30 shadow-sm p-4">
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Template"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    onLoad={() => setImgLoaded(true)}
                  />

                  {imgLoaded && imgRef.current && (
                    <>
                      {/* Title Element */}
                      <div
                        onMouseDown={() => {
                          draggingRef.current = "title";
                          setActiveElement("title");
                        }}
                        onTouchStart={() => {
                          draggingRef.current = "title";
                          setActiveElement("title");
                        }}
                        onClick={() => setActiveElement("title")}
                        style={{
                          left: `${titleElement.xPercent}%`,
                          top: `${titleElement.yPercent}%`,
                          transform: "translate(-50%, -50%)",
                          fontSize: `${getScaledFontSize(titleElement.fontSize)}px`,
                          fontFamily: titleElement.font.replace(".ttf", ""),
                          color: titleElement.color,
                        }}
                        className={clsx(
                          "absolute cursor-grab active:cursor-grabbing select-none whitespace-nowrap px-2 py-1 rounded transition-all",
                          activeElement === "title"
                            ? "bg-blue-500/20 border-2 border-blue-500 ring-2 ring-blue-300"
                            : "bg-primary/10 border border-primary/30 hover:bg-primary/20"
                        )}
                      >
                        {seminarTitle}
                      </div>

                      {/* Name Element */}
                      <div
                        onMouseDown={() => {
                          draggingRef.current = "name";
                          setActiveElement("name");
                        }}
                        onTouchStart={() => {
                          draggingRef.current = "name";
                          setActiveElement("name");
                        }}
                        onClick={() => setActiveElement("name")}
                        style={{
                          left: `${nameElement.xPercent}%`,
                          top: `${nameElement.yPercent}%`,
                          transform: "translate(-50%, -50%)",
                          fontSize: `${getScaledFontSize(nameElement.fontSize)}px`,
                          fontFamily: nameElement.font.replace(".ttf", ""),
                          color: nameElement.color,
                        }}
                        className={clsx(
                          "absolute cursor-grab active:cursor-grabbing select-none whitespace-nowrap px-2 py-1 rounded transition-all",
                          activeElement === "name"
                            ? "bg-green-500/20 border-2 border-green-500 ring-2 ring-green-300"
                            : "bg-primary/10 border border-primary/30 hover:bg-primary/20"
                        )}
                      >
                        {nameElement.text}
                      </div>
                    </>
                  )}
                </div>

                {/* Change Template Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageSrc(undefined);
                      setImageFile(undefined);
                      setImgLoaded(false);
                    }}
                  >
                    Change Template Image
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            {/* Title Controls */}
            <div className="space-y-4 p-4 border rounded-lg bg-foreground/5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Seminar Title</h3>
                <Button
                  size="sm"
                  variant={activeElement === "title" ? "default" : "outline"}
                  onClick={() => setActiveElement("title")}
                  className="text-xs"
                >
                  Select
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    value={titleElement.fontSize}
                    onChange={(e) =>
                      setTitleElement((prev) => ({
                        ...prev,
                        fontSize: parseInt(e.target.value) || 80,
                      }))
                    }
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Font</Label>
                  <Select
                    value={titleElement.font}
                    onValueChange={(value) =>
                      setTitleElement((prev) => ({ ...prev, font: value }))
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_FONTS.map((font) => (
                        <SelectItem
                          key={font.value}
                          value={font.value}
                          className="text-sm"
                        >
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={titleElement.color}
                      onChange={(e) =>
                        setTitleElement((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={titleElement.color}
                      onChange={(e) =>
                        setTitleElement((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>X: {titleElement.xPercent.toFixed(1)}%</div>
                  <div>Y: {titleElement.yPercent.toFixed(1)}%</div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setTitleElement((prev) => ({ ...prev, xPercent: 50 }))
                  }
                  className="w-full text-xs"
                >
                  Center Horizontally
                </Button>
              </div>
            </div>

            {/* Name Controls */}
            <div className="space-y-4 p-4 border rounded-lg bg-foreground/5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Participant Name</h3>
                <Button
                  size="sm"
                  variant={activeElement === "name" ? "default" : "outline"}
                  onClick={() => setActiveElement("name")}
                  className="text-xs"
                >
                  Select
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    value={nameElement.fontSize}
                    onChange={(e) =>
                      setNameElement((prev) => ({
                        ...prev,
                        fontSize: parseInt(e.target.value) || 128,
                      }))
                    }
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Font</Label>
                  <Select
                    value={nameElement.font}
                    onValueChange={(value) =>
                      setNameElement((prev) => ({ ...prev, font: value }))
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_FONTS.map((font) => (
                        <SelectItem
                          key={font.value}
                          value={font.value}
                          className="text-sm"
                        >
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={nameElement.color}
                      onChange={(e) =>
                        setNameElement((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={nameElement.color}
                      onChange={(e) =>
                        setNameElement((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="flex-1 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>X: {nameElement.xPercent.toFixed(1)}%</div>
                  <div>Y: {nameElement.yPercent.toFixed(1)}%</div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setNameElement((prev) => ({ ...prev, xPercent: 50 }))
                  }
                  className="w-full text-xs"
                >
                  Center Horizontally
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !imageSrc}
            className="w-full sm:w-auto gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

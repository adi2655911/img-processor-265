import { useCallback, useState } from "react";
import { Upload, FileImage } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ImageMetadata } from "@shared/schema";

interface ImageUploadZoneProps {
  onFileUpload: (file: File, metadata: ImageMetadata) => void;
  disabled?: boolean;
}

const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function ImageUploadZone({ onFileUpload, disabled }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const getImageMetadata = (file: File): Promise<ImageMetadata> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          filename: file.name,
          width: img.width,
          height: img.height,
          format: file.type.split("/")[1],
          size: file.size,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  };

  const validateAndProcessFile = async (file: File) => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const metadata = await getImageMetadata(file);
      onFileUpload(file, metadata);
      toast({
        title: "Image uploaded",
        description: `${file.name} loaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to read image file.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndProcessFile(file);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  return (
    <Card
      className={`relative min-h-80 border-2 border-dashed transition-all duration-200 ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      data-testid="upload-zone"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={ACCEPTED_FORMATS.join(",")}
        onChange={handleFileSelect}
        disabled={disabled}
        data-testid="input-file-upload"
      />

      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center min-h-80 p-8 cursor-pointer"
      >
        <div
          className={`rounded-full p-6 mb-4 transition-all duration-200 ${
            isDragging ? "bg-primary/20 scale-110" : "bg-card"
          }`}
        >
          {isDragging ? (
            <FileImage className="w-12 h-12 text-primary" />
          ) : (
            <Upload className="w-12 h-12 text-primary" />
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {isDragging ? "Drop your image here" : "Upload Image"}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 text-center">
          Drag and drop or click to browse
        </p>

        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded bg-card">JPG</span>
          <span className="px-2 py-1 rounded bg-card">JPEG</span>
          <span className="px-2 py-1 rounded bg-card">PNG</span>
          <span className="px-2 py-1 rounded bg-card">WebP</span>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Maximum file size: 10MB
        </p>
      </label>
    </Card>
  );
}

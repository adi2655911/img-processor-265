import { useState } from "react";
import { ImageUploadZone } from "@/components/image-upload-zone";
import { ProcessingControls } from "@/components/processing-controls";
import { ImagePreview } from "@/components/image-preview";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { ImageMetadata, ImageProcessingOptions } from "@shared/schema";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (file: File, metadata: ImageMetadata) => {
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
    }
    setUploadedFile(file);
    setImageMetadata(metadata);
    setProcessedImageUrl(null);
    setProcessedBlob(null);
  };

  const handleProcess = async (options: ImageProcessingOptions) => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);
      formData.append("options", JSON.stringify(options));

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Processing failed");
      }

      const blob = await response.blob();
      
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
      
      const url = URL.createObjectURL(blob);
      setProcessedImageUrl(url);
      setProcessedBlob(blob);

      toast({
        title: "Processing complete",
        description: "Your image has been processed successfully.",
      });
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
      setProcessedImageUrl(null);
      setProcessedBlob(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
    }
    setUploadedFile(null);
    setImageMetadata(null);
    setProcessedImageUrl(null);
    setProcessedBlob(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Image Processor <span className="text-primary">265</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ImageUploadZone
              onFileUpload={handleFileUpload}
              disabled={isProcessing}
            />

            {uploadedFile && imageMetadata && (
              <Card className="p-6">
                <ProcessingControls
                  onProcess={handleProcess}
                  isProcessing={isProcessing}
                  imageMetadata={imageMetadata}
                  onReset={handleReset}
                />
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <ImagePreview
              originalFile={uploadedFile}
              processedImageUrl={processedImageUrl}
              processedBlob={processedBlob}
              isProcessing={isProcessing}
              imageMetadata={imageMetadata}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

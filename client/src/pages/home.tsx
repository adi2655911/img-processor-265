import { useState } from "react";
import { ImageUploadZone } from "@/components/image-upload-zone";
import { ProcessingControls } from "@/components/processing-controls";
import { ImagePreview } from "@/components/image-preview";
import { BatchQueue, type BatchItem } from "@/components/batch-queue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Layers, Image as ImageIcon } from "lucide-react";
import type { ImageMetadata, ImageProcessingOptions } from "@shared/schema";

export default function Home() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const { toast } = useToast();

  // Single mode state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageMetadata, setImageMetadata] = useState<ImageMetadata | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Batch mode state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const handleFileUpload = (file: File, metadata: ImageMetadata) => {
    if (mode === "batch") {
      const newItem: BatchItem = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        metadata,
        status: "pending" as const,
      };
      setBatchItems((prev) => [...prev, newItem]);
    } else {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
      setUploadedFile(file);
      setImageMetadata(metadata);
      setProcessedImageUrl(null);
      setProcessedBlob(null);
    }
  };

  const handleMultipleFilesUpload = (files: Array<{ file: File; metadata: ImageMetadata }>) => {
    const newItems: BatchItem[] = files.map(({ file, metadata }) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      metadata,
      status: "pending" as const,
    }));

    setBatchItems((prev) => [...prev, ...newItems]);
    if (mode !== "batch") {
      setMode("batch");
    }
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

  const processImage = async (item: BatchItem, options: ImageProcessingOptions): Promise<{ success: boolean; blob?: Blob }> => {
    setBatchItems(prev =>
      prev.map(i =>
        i.id === item.id ? { ...i, status: "processing" as const } : i
      )
    );

    try {
      const formData = new FormData();
      formData.append("image", item.file);
      formData.append("options", JSON.stringify(options));

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Processing failed");
      }

      const blob = await response.blob();

      setBatchItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, status: "completed" as const, processedBlob: blob }
            : i
        )
      );

      return { success: true, blob };
    } catch (error) {
      console.error("Processing error:", error);
      setBatchItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, status: "error" as const, error: "Processing failed" }
            : i
        )
      );
      return { success: false };
    }
  };

  const handleBatchProcess = async (options: ImageProcessingOptions) => {
    const pendingItems = batchItems.filter(item => item.status === "pending");
    if (pendingItems.length === 0) return;

    setIsBatchProcessing(true);

    const results = await Promise.allSettled(
      pendingItems.map(item => processImage(item, options))
    );

    const completed = results.filter(r => r.status === "fulfilled" && r.value.success).length;
    const failed = results.length - completed;

    setIsBatchProcessing(false);
    
    toast({
      title: "Batch processing complete",
      description: `${completed} succeeded${failed > 0 ? `, ${failed} failed` : ""}.`,
    });
  };

  const handleBatchRemove = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const handleBatchDownload = (id: string) => {
    const item = batchItems.find(i => i.id === id);
    if (!item?.processedBlob) return;

    try {
      const url = URL.createObjectURL(item.processedBlob);
      const a = document.createElement("a");
      a.href = url;
      
      const extension = item.processedBlob.type.split("/")[1] || "png";
      a.download = `processed-${item.metadata.filename}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your processed image is downloading.",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the processed image.",
        variant: "destructive",
      });
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

  const handleBatchReset = () => {
    setBatchItems([]);
    setMode("single");
  };

  const toggleMode = () => {
    if (mode === "single") {
      setMode("batch");
    } else {
      setMode("single");
      handleBatchReset();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Image Processor <span className="text-primary">265</span>
          </h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => mode !== "single" && toggleMode()}
              data-testid="button-mode-single"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Single
            </Button>
            <Button
              variant={mode === "batch" ? "default" : "outline"}
              size="sm"
              onClick={() => mode !== "batch" && toggleMode()}
              data-testid="button-mode-batch"
            >
              <Layers className="w-4 h-4 mr-2" />
              Batch
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === "single" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <ImageUploadZone
                onFileUpload={handleFileUpload}
                onMultipleFilesUpload={handleMultipleFilesUpload}
                disabled={isProcessing}
                allowMultiple={true}
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
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ImageUploadZone
                onFileUpload={handleFileUpload}
                onMultipleFilesUpload={handleMultipleFilesUpload}
                disabled={isBatchProcessing}
                allowMultiple={true}
              />

              <BatchQueue
                items={batchItems}
                onRemove={handleBatchRemove}
                onDownload={handleBatchDownload}
              />
            </div>

            <div className="space-y-6">
              {batchItems.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Batch Settings</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    These settings will apply to all {batchItems.filter(i => i.status === "pending").length} pending image(s).
                  </p>

                  <ProcessingControls
                    onProcess={handleBatchProcess}
                    isProcessing={isBatchProcessing}
                    imageMetadata={batchItems[0]?.metadata || { filename: "", width: 800, height: 600, format: "png", size: 0 }}
                    onReset={handleBatchReset}
                  />
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

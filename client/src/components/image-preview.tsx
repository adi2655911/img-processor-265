import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ImageMetadata } from "@shared/schema";

interface ImagePreviewProps {
  originalFile: File | null;
  processedImageUrl: string | null;
  processedBlob: Blob | null;
  isProcessing: boolean;
  imageMetadata: ImageMetadata | null;
}

export function ImagePreview({
  originalFile,
  processedImageUrl,
  processedBlob,
  isProcessing,
  imageMetadata,
}: ImagePreviewProps) {
  const { toast } = useToast();
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (originalFile) {
      const url = URL.createObjectURL(originalFile);
      setOriginalUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setOriginalUrl(null);
    }
  }, [originalFile]);

  const handleDownload = () => {
    if (!processedBlob) return;

    try {
      const url = URL.createObjectURL(processedBlob);
      const a = document.createElement("a");
      a.href = url;
      
      const extension = processedBlob.type.split("/")[1] || "png";
      a.download = `processed-${Date.now()}.${extension}`;
      
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

  if (!originalFile) {
    return (
      <Card className="min-h-80 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-card mx-auto mb-4 flex items-center justify-center">
            <Download className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No image uploaded</h3>
          <p className="text-sm text-muted-foreground">
            Upload an image to see the preview
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Original
            </h3>
            <div className="relative rounded-md overflow-hidden bg-card border border-border">
              <img
                src={originalUrl || ""}
                alt="Original"
                className="w-full h-auto"
                data-testid="img-original"
              />
            </div>
          </div>

          {(processedImageUrl || isProcessing) && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Preview
              </h3>
              <div className="relative rounded-md overflow-hidden bg-card border border-border min-h-60">
                {isProcessing ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm font-medium" data-testid="text-processing">
                        Processing your image...
                      </p>
                    </div>
                  </div>
                ) : (
                  processedImageUrl && (
                    <>
                      <img
                        src={processedImageUrl}
                        alt="Processed"
                        className="w-full h-auto"
                        data-testid="img-processed"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Button
                          onClick={handleDownload}
                          size="sm"
                          className="shadow-lg"
                          data-testid="button-download"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

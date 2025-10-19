import { X, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ImageMetadata } from "@shared/schema";

export interface BatchItem {
  id: string;
  file: File;
  metadata: ImageMetadata;
  status: "pending" | "processing" | "completed" | "error";
  progress?: number;
  processedBlob?: Blob;
  error?: string;
}

interface BatchQueueProps {
  items: BatchItem[];
  onRemove: (id: string) => void;
  onDownload: (id: string) => void;
}

export function BatchQueue({ items, onRemove, onDownload }: BatchQueueProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Batch Queue</h3>
        <span className="text-sm text-muted-foreground">
          {items.length} image{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-md border border-border hover-elevate"
            data-testid={`batch-item-${item.id}`}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-card">
              <img
                src={URL.createObjectURL(item.file)}
                alt={item.metadata.filename}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {item.metadata.filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.metadata.width} × {item.metadata.height} •{" "}
                {(item.metadata.size / 1024).toFixed(1)} KB
              </p>
              
              {item.status === "error" && (
                <p className="text-xs text-destructive mt-1">{item.error}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {item.status === "pending" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(item.id)}
                  data-testid={`button-remove-${item.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              {item.status === "processing" && (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              )}

              {item.status === "completed" && (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(item.id)}
                    data-testid={`button-download-${item.id}`}
                  >
                    Download
                  </Button>
                </>
              )}

              {item.status === "error" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(item.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

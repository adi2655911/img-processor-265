import { useState } from "react";
import { Wand2, RotateCcw, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { ImageMetadata, ImageProcessingOptions, SupportedFormat } from "@shared/schema";

interface ProcessingControlsProps {
  onProcess: (options: ImageProcessingOptions) => void;
  isProcessing: boolean;
  imageMetadata: ImageMetadata;
  onReset: () => void;
}

const formats: { value: SupportedFormat; label: string }[] = [
  { value: "jpg", label: "JPG" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

export function ProcessingControls({
  onProcess,
  isProcessing,
  imageMetadata,
  onReset,
}: ProcessingControlsProps) {
  const [selectedFormat, setSelectedFormat] = useState<SupportedFormat | undefined>();
  const [width, setWidth] = useState<number | undefined>(imageMetadata.width);
  const [height, setHeight] = useState<number | undefined>(imageMetadata.height);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [removeBackground, setRemoveBackground] = useState(false);

  const aspectRatio = imageMetadata.width / imageMetadata.height;

  const handleWidthChange = (value: string) => {
    const newWidth = value ? parseInt(value, 10) : undefined;
    setWidth(newWidth);

    if (maintainAspectRatio && newWidth) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (value: string) => {
    const newHeight = value ? parseInt(value, 10) : undefined;
    setHeight(newHeight);

    if (maintainAspectRatio && newHeight) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleProcess = () => {
    const options: ImageProcessingOptions = {
      format: selectedFormat,
      width,
      height,
      maintainAspectRatio,
      removeBackground,
    };

    onProcess(options);
  };

  const hasChanges = selectedFormat || width !== imageMetadata.width || height !== imageMetadata.height || removeBackground;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Image Information</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Dimensions:</span>
            <p className="font-medium text-foreground" data-testid="text-original-dimensions">
              {imageMetadata.width} × {imageMetadata.height}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Size:</span>
            <p className="font-medium text-foreground" data-testid="text-original-size">
              {(imageMetadata.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Format:</span>
            <p className="font-medium text-foreground uppercase" data-testid="text-original-format">
              {imageMetadata.format}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Filename:</span>
            <p className="font-medium text-foreground truncate" data-testid="text-original-filename">
              {imageMetadata.filename}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Format Conversion</h3>
        <div className="flex flex-wrap gap-2">
          {formats.map((format) => (
            <Button
              key={format.value}
              variant={selectedFormat === format.value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setSelectedFormat(
                  selectedFormat === format.value ? undefined : format.value
                )
              }
              disabled={isProcessing}
              className="toggle-elevate"
              data-testid={`button-format-${format.value}`}
            >
              {format.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Resize Options</h3>
          <div className="flex items-center gap-2">
            <Switch
              id="aspect-ratio"
              checked={maintainAspectRatio}
              onCheckedChange={setMaintainAspectRatio}
              disabled={isProcessing}
              data-testid="switch-aspect-ratio"
            />
            <Label htmlFor="aspect-ratio" className="text-sm cursor-pointer">
              Lock aspect ratio
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width (px)</Label>
            <Input
              id="width"
              type="number"
              value={width || ""}
              onChange={(e) => handleWidthChange(e.target.value)}
              disabled={isProcessing}
              min="1"
              data-testid="input-width"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (px)</Label>
            <Input
              id="height"
              type="number"
              value={height || ""}
              onChange={(e) => handleHeightChange(e.target.value)}
              disabled={isProcessing}
              min="1"
              data-testid="input-height"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-semibold mb-4">Advanced</h3>
        <div className="flex items-center justify-between p-4 rounded-md border border-border hover-elevate">
          <div className="flex items-center gap-3">
            <Scissors className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Remove Background</p>
              <p className="text-xs text-muted-foreground">
                Removes the image background
              </p>
            </div>
          </div>
          <Switch
            id="remove-bg"
            checked={removeBackground}
            onCheckedChange={setRemoveBackground}
            disabled={isProcessing}
            data-testid="switch-remove-background"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleProcess}
          disabled={isProcessing || !hasChanges}
          className="flex-1"
          size="lg"
          data-testid="button-process"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Process Image
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={onReset}
          disabled={isProcessing}
          size="lg"
          data-testid="button-reset"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

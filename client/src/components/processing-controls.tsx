import { useState, useEffect } from "react";
import { Wand2, RotateCcw, Scissors, RotateCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [quality, setQuality] = useState<number>(90);
  
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropWidth, setCropWidth] = useState<number>(imageMetadata.width);
  const [cropHeight, setCropHeight] = useState<number>(imageMetadata.height);
  const [enableCrop, setEnableCrop] = useState(false);
  
  const [rotation, setRotation] = useState<number>(0);
  
  const [grayscale, setGrayscale] = useState(false);
  const [sepia, setSepia] = useState(false);
  const [blur, setBlur] = useState<number>(0);
  const [sharpen, setSharpen] = useState<number>(0);
  
  const [brightness, setBrightness] = useState<number>(1);
  const [contrast, setContrast] = useState<number>(1);

  const aspectRatio = imageMetadata.width / imageMetadata.height;

  const resetControls = () => {
    setWidth(imageMetadata.width);
    setHeight(imageMetadata.height);
    setSelectedFormat(undefined);
    setRemoveBackground(false);
    setQuality(90);
    setMaintainAspectRatio(true);
    setCropX(0);
    setCropY(0);
    setCropWidth(imageMetadata.width);
    setCropHeight(imageMetadata.height);
    setEnableCrop(false);
    setRotation(0);
    setGrayscale(false);
    setSepia(false);
    setBlur(0);
    setSharpen(0);
    setBrightness(1);
    setContrast(1);
  };

  useEffect(() => {
    resetControls();
  }, [imageMetadata.filename]);

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
      quality,
      crop: enableCrop ? { x: cropX, y: cropY, width: cropWidth, height: cropHeight } : undefined,
      rotation: rotation !== 0 ? rotation : undefined,
      filters: (grayscale || sepia || blur > 0 || sharpen > 0) ? {
        grayscale,
        sepia,
        blur: blur > 0 ? blur : undefined,
        sharpen: sharpen > 0 ? sharpen : undefined,
      } : undefined,
      brightness: brightness !== 1 ? brightness : undefined,
      contrast: contrast !== 1 ? contrast : undefined,
    };

    onProcess(options);
  };

  const hasChanges = selectedFormat || width !== imageMetadata.width || height !== imageMetadata.height || removeBackground || quality !== 90 || enableCrop || rotation !== 0 || grayscale || sepia || blur > 0 || sharpen > 0 || brightness !== 1 || contrast !== 1;

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
        <h3 className="text-lg font-semibold mb-4">Image Quality</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality">Quality: {quality}%</Label>
              <span className="text-xs text-muted-foreground">
                {quality >= 90 ? "High" : quality >= 70 ? "Medium" : "Low"}
              </span>
            </div>
            <Slider
              id="quality"
              min={1}
              max={100}
              step={1}
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              disabled={isProcessing}
              className="w-full"
              data-testid="slider-quality"
            />
            <p className="text-xs text-muted-foreground">
              Lower quality reduces file size but may affect image clarity
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
          <TabsTrigger value="filters" data-testid="tab-filters">Filters</TabsTrigger>
          <TabsTrigger value="transform" data-testid="tab-transform">Transform</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
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
        </TabsContent>

        <TabsContent value="filters" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-md border border-border hover-elevate">
              <div>
                <p className="font-medium">Grayscale</p>
                <p className="text-xs text-muted-foreground">Convert to black and white</p>
              </div>
              <Switch
                checked={grayscale}
                onCheckedChange={setGrayscale}
                disabled={isProcessing}
                data-testid="switch-grayscale"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-md border border-border hover-elevate">
              <div>
                <p className="font-medium">Sepia</p>
                <p className="text-xs text-muted-foreground">Apply vintage sepia tone</p>
              </div>
              <Switch
                checked={sepia}
                onCheckedChange={setSepia}
                disabled={isProcessing}
                data-testid="switch-sepia"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Blur: {blur}%</Label>
                <span className="text-xs text-muted-foreground">
                  {blur === 0 ? "None" : blur < 30 ? "Subtle" : blur < 70 ? "Medium" : "Strong"}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[blur]}
                onValueChange={(value) => setBlur(value[0])}
                disabled={isProcessing}
                data-testid="slider-blur"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sharpen: {sharpen}</Label>
                <span className="text-xs text-muted-foreground">
                  {sharpen === 0 ? "None" : sharpen < 4 ? "Subtle" : sharpen < 7 ? "Medium" : "Strong"}
                </span>
              </div>
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={[sharpen]}
                onValueChange={(value) => setSharpen(value[0])}
                disabled={isProcessing}
                data-testid="slider-sharpen"
              />
            </div>

            <div className="space-y-2">
              <Label>Brightness: {brightness.toFixed(2)}</Label>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
                disabled={isProcessing}
                data-testid="slider-brightness"
              />
              <p className="text-xs text-muted-foreground">
                1.0 = normal, &lt;1.0 = darker, &gt;1.0 = brighter
              </p>
            </div>

            <div className="space-y-2">
              <Label>Contrast: {contrast.toFixed(2)}</Label>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={[contrast]}
                onValueChange={(value) => setContrast(value[0])}
                disabled={isProcessing}
                data-testid="slider-contrast"
              />
              <p className="text-xs text-muted-foreground">
                1.0 = normal, &lt;1.0 = less, &gt;1.0 = more
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transform" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold">Rotation</Label>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  disabled={isProcessing}
                  data-testid="button-rotate-90"
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(180)}
                  disabled={isProcessing}
                  data-testid="button-rotate-180"
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  180°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(270)}
                  disabled={isProcessing}
                  data-testid="button-rotate-270"
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  270°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(0)}
                  disabled={isProcessing}
                  data-testid="button-rotate-reset"
                >
                  Reset
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Custom Rotation: {rotation}°</Label>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[rotation]}
                  onValueChange={(value) => setRotation(value[0])}
                  disabled={isProcessing}
                  data-testid="slider-rotation"
                />
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold">Crop</Label>
                <Switch
                  checked={enableCrop}
                  onCheckedChange={setEnableCrop}
                  disabled={isProcessing}
                  data-testid="switch-enable-crop"
                />
              </div>
              
              {enableCrop && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Define the crop region within the image bounds ({imageMetadata.width} × {imageMetadata.height})
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-2">
                      <Label htmlFor="crop-x">X Position</Label>
                      <Input
                        id="crop-x"
                        type="number"
                        value={cropX}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(parseInt(e.target.value) || 0, imageMetadata.width - cropWidth));
                          setCropX(val);
                        }}
                        disabled={isProcessing}
                        min={0}
                        max={imageMetadata.width - cropWidth}
                        data-testid="input-crop-x"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crop-y">Y Position</Label>
                      <Input
                        id="crop-y"
                        type="number"
                        value={cropY}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(parseInt(e.target.value) || 0, imageMetadata.height - cropHeight));
                          setCropY(val);
                        }}
                        disabled={isProcessing}
                        min={0}
                        max={imageMetadata.height - cropHeight}
                        data-testid="input-crop-y"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crop-width">Crop Width</Label>
                      <Input
                        id="crop-width"
                        type="number"
                        value={cropWidth}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(parseInt(e.target.value) || 1, imageMetadata.width - cropX));
                          setCropWidth(val);
                        }}
                        disabled={isProcessing}
                        min={1}
                        max={imageMetadata.width - cropX}
                        data-testid="input-crop-width"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="crop-height">Crop Height</Label>
                      <Input
                        id="crop-height"
                        type="number"
                        value={cropHeight}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(parseInt(e.target.value) || 1, imageMetadata.height - cropY));
                          setCropHeight(val);
                        }}
                        disabled={isProcessing}
                        min={1}
                        max={imageMetadata.height - cropY}
                        data-testid="input-crop-height"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
          onClick={() => {
            resetControls();
            onReset();
          }}
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

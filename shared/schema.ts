import { z } from "zod";

export const supportedFormats = ["jpg", "jpeg", "png", "webp"] as const;
export type SupportedFormat = typeof supportedFormats[number];

export const imageProcessingOptionsSchema = z.object({
  format: z.enum(supportedFormats).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  removeBackground: z.boolean().optional(),
  maintainAspectRatio: z.boolean().optional(),
  quality: z.number().int().min(1).max(100).optional(),
});

export type ImageProcessingOptions = z.infer<typeof imageProcessingOptionsSchema>;

export interface ProcessedImage {
  filename: string;
  originalFilename: string;
  path: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ImageMetadata {
  filename: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

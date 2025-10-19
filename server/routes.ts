import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";
import { imageProcessingOptionsSchema } from "@shared/schema";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const OUTPUT_DIR = path.join(process.cwd(), "outputs");

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await ensureDirectoryExists(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and WebP are allowed."));
    }
  },
});

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function cleanupOldFiles() {
  try {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000;

    for (const dir of [UPLOAD_DIR, OUTPUT_DIR]) {
      try {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          if (now - stats.mtimeMs > maxAge) {
            await fs.unlink(filePath);
          }
        }
      } catch (error) {
        console.error(`Error cleaning ${dir}:`, error);
      }
    }
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}

setInterval(cleanupOldFiles, 5 * 60 * 1000);

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureDirectoryExists(UPLOAD_DIR);
  await ensureDirectoryExists(OUTPUT_DIR);

  app.post("/api/process", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const optionsJson = req.body.options;
      let options;

      try {
        options = imageProcessingOptionsSchema.parse(JSON.parse(optionsJson));
      } catch (error) {
        return res.status(400).json({ error: "Invalid processing options" });
      }

      const inputPath = req.file.path;
      const outputFilename = `processed-${Date.now()}-${Math.round(Math.random() * 1e9)}.${options.format || path.extname(req.file.originalname).slice(1) || "png"}`;
      const outputPath = path.join(OUTPUT_DIR, outputFilename);

      let image = sharp(inputPath);

      if (options.width || options.height) {
        image = image.resize(options.width, options.height, {
          fit: options.maintainAspectRatio ? "inside" : "fill",
          withoutEnlargement: false,
        });
      }

      if (options.removeBackground) {
        image = image.removeAlpha().flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } });
      }

      if (options.format) {
        switch (options.format) {
          case "jpg":
          case "jpeg":
            image = image.jpeg({ quality: 90 });
            break;
          case "png":
            image = image.png({ quality: 90 });
            break;
          case "webp":
            image = image.webp({ quality: 90 });
            break;
        }
      }

      await image.toFile(outputPath);

      await fs.unlink(inputPath);

      res.sendFile(outputPath, async (err) => {
        if (!err) {
          setTimeout(async () => {
            try {
              await fs.unlink(outputPath);
            } catch (error) {
              console.error("Error deleting output file:", error);
            }
          }, 60000);
        }
      });
    } catch (error) {
      console.error("Processing error:", error);
      
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting uploaded file:", unlinkError);
        }
      }

      res.status(500).json({ error: "Image processing failed" });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const httpServer = createServer(app);

  return httpServer;
}

import path from "path";
import { fileURLToPath } from "url";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { t } from "../utils/i18n.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif", "image/gif": ".gif" };

/** multer: keep the file in memory, images only, max 5MB */
export const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, Boolean(ALLOWED[file.mimetype])),
}).single("image");

const useCloudinary = () => Boolean(process.env.CLOUDINARY_URL);

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "smart-vacation", resource_type: "image" }, (err, result) =>
        err ? reject(err) : resolve(result.secure_url)
      )
      .end(buffer);
  });

/**
 * Admin image upload.
 * With CLOUDINARY_URL set → stored on Cloudinary (recommended in production, Render's disk is temporary).
 * Otherwise → saved to server/uploads and served from /api/uploads (fine for local development).
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: t(req, "uploadInvalid") });

    if (useCloudinary()) {
      const url = await uploadToCloudinary(req.file.buffer);
      return res.status(201).json({ url });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}${ALLOWED[req.file.mimetype]}`;
    await writeFile(path.join(UPLOAD_DIR, filename), req.file.buffer);
    res.status(201).json({ url: `/api/uploads/${filename}` });
  } catch (err) {
    console.error("Upload failed:", err.message);
    res.status(500).json({ message: t(req, "serverError") });
  }
};

/** multer errors (e.g. file too large) → friendly message */
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) return res.status(400).json({ message: t(req, "uploadInvalid") });
  next(err);
};

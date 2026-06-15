import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

let configured = false;
function ensureConfigured(): void {
  if (configured) return;
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export interface CloudinaryFile {
  publicId: string;
  url: string;
}

/** Uploads a buffer to Cloudinary as a raw asset (works for pdf/doc/image alike). */
export function uploadBufferToCloudinary(buffer: Buffer, originalName: string): Promise<CloudinaryFile> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'nexus/documents', resource_type: 'raw', use_filename: true, unique_filename: true, filename_override: originalName },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'));
        resolve({ publicId: result.public_id, url: result.secure_url });
      }
    );
    stream.end(buffer);
  });
}

export function deleteFromCloudinary(publicId: string): Promise<void> {
  ensureConfigured();
  return cloudinary.uploader
    .destroy(publicId, { resource_type: 'raw' })
    .then(() => undefined)
    .catch(() => undefined);
}

// server/src/controllers/upload.controller.ts
// Handles image uploads to Cloudinary

import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided.' });
      return;
    }

    // Upload buffer directly to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:         'campus-navigator',
          transformation: [
            { width: 800, height: 600, crop: 'fill', gravity: 'auto' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    res.status(200).json({
      url:       result.secure_url,
      public_id: result.public_id,
      width:     result.width,
      height:    result.height,
    });

  } catch (err: any) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Image upload failed. Please try again.' });
  }
}

// Delete an image from Cloudinary (when location is deleted)
export async function deleteImage(req: Request, res: Response): Promise<void> {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      res.status(400).json({ error: 'No public_id provided.' });
      return;
    }
    await cloudinary.uploader.destroy(public_id);
    res.status(200).json({ message: 'Image deleted successfully.' });
  } catch (err: any) {
    console.error('Delete image error:', err.message);
    res.status(500).json({ error: 'Failed to delete image.' });
  }
}

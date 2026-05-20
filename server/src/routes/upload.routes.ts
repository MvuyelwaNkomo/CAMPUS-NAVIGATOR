// server/src/routes/upload.routes.ts

import { Router }             from 'express';
import multer                 from 'multer';
import { requireAuth }        from '../middleware/auth.middleware';
import { requireAdmin }       from '../middleware/role.middleware';
import { uploadImage, deleteImage } from '../controllers/upload.controller';

const router = Router();

// Use memory storage — file stays in buffer, sent directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and WebP images are allowed.'));
    }
  }
});

// All upload routes require admin
router.use(requireAuth, requireAdmin);

router.post('/image',  upload.single('image'), uploadImage);
router.delete('/image', deleteImage);

export default router;
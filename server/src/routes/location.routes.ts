// server/src/routes/location.routes.ts

import { Router } from 'express';
import { getLocations, getLocationById } from '../controllers/location.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// All location routes require login
router.get('/',   requireAuth, getLocations);
router.get('/:id',requireAuth, getLocationById);

export default router;

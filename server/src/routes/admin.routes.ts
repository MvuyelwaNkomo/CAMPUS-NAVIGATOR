// server/src/routes/admin.routes.ts

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin, requireSuperAdmin } from '../middleware/role.middleware';
import {
  getAllLocations, createLocation, updateLocation, softDeleteLocation, restoreLocation,
  getTips, addTip, updateTip, deleteTip,
  getPins, createPin, updatePin, deletePin,
  getStats,
  getUsers, changeUserRole, setUserStatus,
  getAuditLog
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require auth + admin role minimum
router.use(requireAuth, requireAdmin);

// ── Stats
router.get('/stats', getStats);

// ── Locations
router.get(   '/locations',              getAllLocations);
router.post(  '/locations',              createLocation);
router.put(   '/locations/:id',          updateLocation);
router.delete('/locations/:id',          softDeleteLocation);
router.post(  '/locations/:id/restore',  requireSuperAdmin, restoreLocation);

// ── Tips
router.get(   '/locations/:id/tips',     getTips);
router.post(  '/locations/:id/tips',     addTip);
router.put(   '/tips/:tipId',            updateTip);
router.delete('/tips/:tipId',            deleteTip);

// ── Pins
router.get(   '/pins',                   getPins);
router.post(  '/pins',                   createPin);
router.put(   '/pins/:locationId',       updatePin);
router.delete('/pins/:locationId',       deletePin);

// ── Users (superadmin only)
router.get(   '/users',                  requireSuperAdmin, getUsers);
router.patch( '/users/:id/role',         requireSuperAdmin, changeUserRole);
router.patch( '/users/:id/status',       requireSuperAdmin, setUserStatus);

// ── Audit Log (superadmin only)
router.get(   '/audit-log',              requireSuperAdmin, getAuditLog);

export default router;

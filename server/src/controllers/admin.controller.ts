// server/src/controllers/admin.controller.ts
// Admin-only endpoints: manage locations, pins, tips, users, audit log

import { Request, Response } from 'express';
import pool from '../db/pool';
import { logAction } from '../utils/audit';

// ── LOCATIONS ─────────────────────────────────────────────────────────────────

export async function getAllLocations(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT l.*, c.label AS category_label, hr.label AS region_label
     FROM locations l
     JOIN categories c ON l.category_id = c.id
     LEFT JOIN hostel_regions hr ON l.hostel_region_id = hr.id
     ORDER BY l.is_active DESC, l.name ASC`
  );
  res.status(200).json({ locations: result.rows });
}

export async function createLocation(req: Request, res: Response): Promise<void> {
  try {
    const {
      name, description, image_url, hours, contact_email,
      contact_phone, is_high_rise, floors, category_id, hostel_region_id
    } = req.body;

    if (!name || !description || !category_id) {
      res.status(400).json({ error: 'Name, description and category are required.' });
      return;
    }

    // Auto-generate unique ID
    const id = `loc_${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO locations
        (id, name, description, image_url, hours, contact_email, contact_phone,
         is_high_rise, floors, category_id, hostel_region_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        id, name, description,
        image_url     || null,
        hours         || null,
        contact_email || null,
        contact_phone || null,
        is_high_rise  || false,
        floors        ? parseInt(floors) : null,
        parseInt(category_id),
        hostel_region_id ? parseInt(hostel_region_id) : null,
        req.user?.userId
      ]
    );

    const location = result.rows[0];

    await logAction({
      userId:      req.user?.userId,
      action:      'CREATE_LOCATION',
      tableName:   'locations',
      recordId:    location.id,
      newData:     location,
      description: `Created location: ${name}`,
      ipAddress:   req.ip
    });

    res.status(201).json({ location });

  } catch (err: any) {
    console.error('Create location error:', err.message);
    res.status(500).json({ error: 'Failed to create location. Please try again.' });
  }
}


export async function updateLocation(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  // Snapshot old data for audit
  const old = await pool.query(`SELECT * FROM locations WHERE id = $1`, [id]);
  if (old.rowCount === 0) { res.status(404).json({ error: 'Location not found.' }); return; }

  const {
    name, description, image_url, hours, contact_email,
    contact_phone, is_high_rise, floors, category_id, hostel_region_id
  } = req.body;

  const result = await pool.query(
    `UPDATE locations
     SET name=$1, description=$2, image_url=$3, hours=$4, contact_email=$5,
         contact_phone=$6, is_high_rise=$7, floors=$8, category_id=$9,
         hostel_region_id=$10, updated_by=$11
     WHERE id=$12 RETURNING *`,
    [name, description, image_url, hours, contact_email,
     contact_phone, is_high_rise, floors || null,
     category_id, hostel_region_id || null, req.user?.userId, id]
  );

  await logAction({
    userId: req.user?.userId, action: 'UPDATE_LOCATION',
    tableName: 'locations', recordId: id,
    oldData: old.rows[0], newData: result.rows[0],
    description: `Updated location: ${id}`, ipAddress: req.ip
  });

  res.status(200).json({ location: result.rows[0] });
}

export async function softDeleteLocation(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const old = await pool.query(`SELECT * FROM locations WHERE id = $1`, [id]);
  if (old.rowCount === 0) { res.status(404).json({ error: 'Location not found.' }); return; }

  await pool.query(`UPDATE locations SET is_active = FALSE, updated_by = $1 WHERE id = $2`, [req.user?.userId, id]);

  await logAction({
    userId: req.user?.userId, action: 'DELETE_LOCATION',
    tableName: 'locations', recordId: id,
    oldData: old.rows[0], description: `Soft-deleted location: ${id}`, ipAddress: req.ip
  });

  res.status(200).json({ message: 'Location deactivated successfully.' });
}

export async function restoreLocation(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  await pool.query(`UPDATE locations SET is_active = TRUE, updated_by = $1 WHERE id = $2`, [req.user?.userId, id]);

  await logAction({ userId: req.user?.userId, action: 'RESTORE_LOCATION', tableName: 'locations', recordId: id, ipAddress: req.ip });
  res.status(200).json({ message: 'Location restored successfully.' });
}

// ── TIPS ──────────────────────────────────────────────────────────────────────

export async function getTips(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT * FROM location_tips WHERE location_id = $1 ORDER BY sort_order ASC`,
    [req.params.id]
  );
  res.status(200).json({ tips: result.rows });
}

export async function addTip(req: Request, res: Response): Promise<void> {
  const { tip_text, sort_order } = req.body;
  const result = await pool.query(
    `INSERT INTO location_tips (location_id, tip_text, sort_order, created_by)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.params.id, tip_text, sort_order || 0, req.user?.userId]
  );

  await logAction({ userId: req.user?.userId, action: 'ADD_TIP', tableName: 'location_tips', recordId: String(result.rows[0].id), newData: result.rows[0], ipAddress: req.ip });
  res.status(201).json({ tip: result.rows[0] });
}

export async function updateTip(req: Request, res: Response): Promise<void> {
  const old = await pool.query(`SELECT * FROM location_tips WHERE id = $1`, [req.params.tipId]);
  if (old.rowCount === 0) { res.status(404).json({ error: 'Tip not found.' }); return; }

  const { tip_text, sort_order } = req.body;
  const result = await pool.query(
    `UPDATE location_tips SET tip_text = $1, sort_order = $2 WHERE id = $3 RETURNING *`,
    [tip_text, sort_order, req.params.tipId]
  );

  await logAction({ userId: req.user?.userId, action: 'UPDATE_TIP', tableName: 'location_tips', recordId: req.params.tipId, oldData: old.rows[0], newData: result.rows[0], ipAddress: req.ip });
  res.status(200).json({ tip: result.rows[0] });
}

export async function deleteTip(req: Request, res: Response): Promise<void> {
  const old = await pool.query(`SELECT * FROM location_tips WHERE id = $1`, [req.params.tipId]);
  if (old.rowCount === 0) { res.status(404).json({ error: 'Tip not found.' }); return; }

  await pool.query(`DELETE FROM location_tips WHERE id = $1`, [req.params.tipId]);
  await logAction({ userId: req.user?.userId, action: 'DELETE_TIP', tableName: 'location_tips', recordId: req.params.tipId, oldData: old.rows[0], ipAddress: req.ip });
  res.status(200).json({ message: 'Tip deleted.' });
}

// ── MAP PINS ──────────────────────────────────────────────────────────────────

export async function getPins(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT l.id, l.name, c.name AS category, mc.latitude, mc.longitude, mc.pinned_at
     FROM locations l
     JOIN categories c ON l.category_id = c.id
     LEFT JOIN map_coordinates mc ON l.id = mc.location_id
     WHERE l.is_active = TRUE
     ORDER BY l.name ASC`
  );
  res.status(200).json({ pins: result.rows });
}

export async function createPin(req: Request, res: Response): Promise<void> {
  const { location_id, latitude, longitude, accuracy_m } = req.body;

  const existing = await pool.query(`SELECT id FROM map_coordinates WHERE location_id = $1`, [location_id]);
  if (existing.rowCount && existing.rowCount > 0) {
    res.status(409).json({ error: 'This location already has a pin. Use PUT to update it.' });
    return;
  }

  const result = await pool.query(
    `INSERT INTO map_coordinates (location_id, latitude, longitude, accuracy_m, pinned_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [location_id, latitude, longitude, accuracy_m || null, req.user?.userId]
  );

  await logAction({
    userId: req.user?.userId, action: 'PIN_LOCATION',
    tableName: 'map_coordinates', recordId: location_id,
    newData: result.rows[0],
    description: `Pinned location ${location_id} at (${latitude}, ${longitude})`,
    ipAddress: req.ip
  });

  res.status(201).json({ pin: result.rows[0] });
}

export async function updatePin(req: Request, res: Response): Promise<void> {
  const { locationId } = req.params;
  const old = await pool.query(`SELECT * FROM map_coordinates WHERE location_id = $1`, [locationId]);
  if (old.rowCount === 0) { res.status(404).json({ error: 'No pin found for this location.' }); return; }

  const { latitude, longitude, accuracy_m } = req.body;
  const result = await pool.query(
    `UPDATE map_coordinates
     SET latitude=$1, longitude=$2, accuracy_m=$3, updated_by=$4
     WHERE location_id=$5 RETURNING *`,
    [latitude, longitude, accuracy_m || null, req.user?.userId, locationId]
  );

  await logAction({ userId: req.user?.userId, action: 'UPDATE_PIN', tableName: 'map_coordinates', recordId: locationId, oldData: old.rows[0], newData: result.rows[0], ipAddress: req.ip });
  res.status(200).json({ pin: result.rows[0] });
}

export async function deletePin(req: Request, res: Response): Promise<void> {
  const { locationId } = req.params;
  const old = await pool.query(`SELECT * FROM map_coordinates WHERE location_id = $1`, [locationId]);
  if (old.rowCount === 0) { res.status(404).json({ error: 'No pin found for this location.' }); return; }

  await pool.query(`DELETE FROM map_coordinates WHERE location_id = $1`, [locationId]);
  await logAction({ userId: req.user?.userId, action: 'DELETE_PIN', tableName: 'map_coordinates', recordId: locationId, oldData: old.rows[0], ipAddress: req.ip });
  res.status(200).json({ message: 'Pin removed successfully.' });
}

// ── STATS ─────────────────────────────────────────────────────────────────────

export async function getStats(req: Request, res: Response): Promise<void> {
  const result = await pool.query(`SELECT * FROM v_admin_stats`);
  res.status(200).json({ stats: result.rows[0] });
}

// ── USERS (superadmin only) ───────────────────────────────────────────────────

export async function getUsers(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT u.id, u.student_number, u.email, u.first_name, u.last_name,
            u.is_active, u.is_verified, u.last_login, u.login_count,
            u.created_at, r.name AS role
     FROM users u JOIN roles r ON u.role_id = r.id
     ORDER BY u.created_at DESC`
  );
  res.status(200).json({ users: result.rows });
}
// ── Categories ────────────────────────────────────────────────────────────────
export async function getCategories(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT id, name, label FROM categories ORDER BY sort_order ASC`
  );
  res.status(200).json({ categories: result.rows });
}

// ── Hostel Regions ────────────────────────────────────────────────────────────
export async function getHostelRegions(req: Request, res: Response): Promise<void> {
  const result = await pool.query(
    `SELECT id, name, label FROM hostel_regions ORDER BY id ASC`
  );
  res.status(200).json({ regions: result.rows });
}
export async function changeUserRole(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { role } = req.body;

  const roleResult = await pool.query(`SELECT id FROM roles WHERE name = $1`, [role]);
  if (roleResult.rowCount === 0) { res.status(400).json({ error: 'Invalid role.' }); return; }

  const old = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  await pool.query(`UPDATE users SET role_id = $1 WHERE id = $2`, [roleResult.rows[0].id, id]);

  await logAction({ userId: req.user?.userId, action: 'CHANGE_ROLE', tableName: 'users', recordId: id, oldData: old.rows[0], newData: { role }, ipAddress: req.ip });
  res.status(200).json({ message: `User role updated to ${role}.` });
}

export async function setUserStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { is_active } = req.body;

  await pool.query(`UPDATE users SET is_active = $1 WHERE id = $2`, [is_active, id]);

  const action = is_active ? 'REACTIVATE_USER' : 'DEACTIVATE_USER';
  await logAction({ userId: req.user?.userId, action, tableName: 'users', recordId: id, ipAddress: req.ip });
  res.status(200).json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully.` });
}

// ── AUDIT LOG (superadmin only) ───────────────────────────────────────────────

export async function getAuditLog(req: Request, res: Response): Promise<void> {
  const { page = '1', limit = '50', action } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = `
    SELECT a.id, a.action, a.table_name, a.record_id, a.description,
           a.ip_address, a.created_at,
           u.email AS user_email,
           u.first_name || ' ' || u.last_name AS user_name
    FROM audit_log a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1`;
  const params: (string | number)[] = [];
  let i = 1;

  if (action) { query += ` AND a.action = $${i}`; params.push(action); i++; }

  query += ` ORDER BY a.created_at DESC LIMIT $${i} OFFSET $${i + 1}`;
  params.push(parseInt(limit), offset);

  const result = await pool.query(query, params);
  const count  = await pool.query(`SELECT COUNT(*) FROM audit_log`);

  res.status(200).json({ logs: result.rows, total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
}

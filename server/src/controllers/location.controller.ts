// server/src/controllers/location.controller.ts
// Student-facing location endpoints — read-only, active locations only

import { Request, Response } from 'express';
import pool from '../db/pool';

// ── GET /api/locations ────────────────────────────────────────────────────────
export async function getLocations(req: Request, res: Response): Promise<void> {
  const { search, category, hostel_region } = req.query as Record<string, string>;

  let query = `SELECT * FROM v_locations_full WHERE 1=1`;
  const params: string[] = [];
  let i = 1;

  if (search) {
    query += ` AND (name ILIKE $${i} OR description ILIKE $${i})`;
    params.push(`%${search}%`);
    i++;
  }

  if (category && category !== 'all') {
    query += ` AND category = $${i}`;
    params.push(category);
    i++;
  }

  if (hostel_region) {
    query += ` AND hostel_region = $${i}`;
    params.push(hostel_region);
    i++;
  }

  query += ` ORDER BY name ASC`;

  const result = await pool.query(query, params);
  res.status(200).json({ locations: result.rows });
}

// ── GET /api/locations/:id ────────────────────────────────────────────────────
export async function getLocationById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT * FROM v_locations_full WHERE id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    res.status(404).json({ error: 'Location not found.' });
    return;
  }

  res.status(200).json({ location: result.rows[0] });
}

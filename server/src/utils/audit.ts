// server/src/utils/audit.ts
// Helper to write entries to the audit_log table

import pool from '../db/pool';

type AuditAction =
  | 'CREATE_LOCATION' | 'UPDATE_LOCATION' | 'DELETE_LOCATION' | 'RESTORE_LOCATION'
  | 'PIN_LOCATION'    | 'UPDATE_PIN'       | 'DELETE_PIN'
  | 'ADD_TIP'         | 'UPDATE_TIP'       | 'DELETE_TIP'
  | 'CREATE_USER'     | 'UPDATE_USER'      | 'DEACTIVATE_USER' | 'REACTIVATE_USER' | 'CHANGE_ROLE'
  | 'LOGIN'           | 'LOGOUT'           | 'FAILED_LOGIN'    | 'PASSWORD_RESET';

interface AuditParams {
  userId?:      string | null;
  action:       AuditAction;
  tableName?:   string;
  recordId?:    string | string[];   // string[] covers Express req.params typing
  oldData?:     object | null;
  newData?:     object | null;
  description?: string;
  ipAddress?:   string;
  userAgent?:   string;
}

export async function logAction(params: AuditParams): Promise<void> {
  const {
    userId = null, action, tableName = null,
    recordId: rawRecordId = null,
    oldData = null, newData = null, description = null,
    ipAddress = null, userAgent = null
  } = params;

  // Normalise recordId — Express can give string | string[]
  const recordId = Array.isArray(rawRecordId)
    ? rawRecordId[0]
    : rawRecordId ?? null;

  try {
    await pool.query(
      `INSERT INTO audit_log
        (user_id, action, table_name, record_id, old_data, new_data, description, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId, action, tableName, recordId,
        oldData  ? JSON.stringify(oldData)  : null,
        newData  ? JSON.stringify(newData)  : null,
        description, ipAddress, userAgent
      ]
    );
  } catch (err) {
    // Audit failures should never crash the main request
    console.error('Audit log write failed:', err);
  }
}

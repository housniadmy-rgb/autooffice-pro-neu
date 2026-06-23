const { v4: uuidv4 } = require('uuid');

function logActivity(db, practiceId, userEmail, action, entityType, entityId, details) {
  try {
    db.prepare(`
      INSERT INTO activity_log (id, practice_id, user_email, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      practiceId || null,
      userEmail || null,
      action,
      entityType || null,
      entityId || null,
      details ? JSON.stringify(details) : null,
    );
  } catch (err) {
    console.error('[ACTIVITY] Log fehlgeschlagen:', err.message);
  }
}

module.exports = { logActivity };

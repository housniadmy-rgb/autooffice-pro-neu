const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'data', 'praxisonline24.db');

class DB {
  constructor(sqlDb) {
    this._db = sqlDb;
    this._inTransaction = false;
  }

  _save() {
    const data = this._db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }

  pragma(expr) {
    this._db.run(`PRAGMA ${expr}`);
  }

  exec(sql) {
    this._db.exec(sql);
    this._save();
  }

  prepare(sql) {
    const wrapper = this;

    const execStmt = (params) => {
      const stmt = wrapper._db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
    };

    const queryAll = (params) => {
      const stmt = wrapper._db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    };

    const queryOne = (params) => {
      const stmt = wrapper._db.prepare(sql);
      stmt.bind(params);
      let row = null;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();
      return row;
    };

    return {
      run(...params) {
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        execStmt(p);
        if (!wrapper._inTransaction) {
          wrapper._save();
        }
        return { changes: 1 };
      },
      get(...params) {
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        return queryOne(p);
      },
      all(...params) {
        const p = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        return queryAll(p);
      },
    };
  }

  transaction(fn) {
    const wrapper = this;
    return (...args) => {
      this._db.run('BEGIN');
      wrapper._inTransaction = true;
      try {
        fn(...args);
        this._db.run('COMMIT');
        wrapper._inTransaction = false;
        wrapper._save();
      } catch (err) {
        try {
          this._db.run('ROLLBACK');
        } catch {
          // transaction may have auto-rolled back on SQL error
        }
        wrapper._inTransaction = false;
        throw err;
      }
    };
  }
}

function logOwnerPasswordMissing(headline, ownerEmail) {
  console.error('');
  console.error('=========================================================');
  console.error(`[db] ${headline}`);
  console.error(`     Grund:       Env-Var OWNER_INITIAL_PASSWORD fehlt.`);
  console.error(`     OWNER_EMAIL: ${ownerEmail}`);
  console.error('');
  console.error('     So beheben im Render Dashboard:');
  console.error('       1. https://dashboard.render.com → Service "praxisonline24"');
  console.error('       2. Tab "Environment" → "Add Environment Variable"');
  console.error('       3. Key:   OWNER_INITIAL_PASSWORD');
  console.error('       4. Value: <starkes Passwort, mind. 8 Zeichen; 16+ empfohlen>');
  console.error('       5. Speichern → Render startet den Service automatisch neu.');
  console.error('');
  console.error('     Der Server läuft normal weiter; nur der Owner-Login ist gesperrt.');
  console.error('=========================================================');
  console.error('');
}

async function ensureOwnerAccount(db) {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return;

  const existing = db.prepare('SELECT id, role FROM users WHERE LOWER(email) = LOWER(?)').get(ownerEmail);

  if (existing) {
    if (existing.role !== 'admin') {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', existing.id);
      console.log(`[db] Owner ${ownerEmail}: Rolle auf admin korrigiert`);
    }
    if (process.env.OWNER_FORCE_RESET === 'true') {
      const ownerPassword = process.env.OWNER_INITIAL_PASSWORD;
      if (ownerPassword) {
        const hash = await bcrypt.hash(ownerPassword, 12);
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, existing.id);
        console.log(`[db] Owner ${ownerEmail}: Passwort per OWNER_FORCE_RESET zurückgesetzt`);
      } else {
        logOwnerPasswordMissing('OWNER_FORCE_RESET=true, aber Passwort-Reset übersprungen', ownerEmail);
      }
    }
    return;
  }

  const ownerPassword = process.env.OWNER_INITIAL_PASSWORD;
  if (!ownerPassword) {
    logOwnerPasswordMissing('Owner-Account NICHT angelegt', ownerEmail);
    return;
  }

  if (ownerPassword.length < 8) {
    console.error('[db] Owner-Account NICHT angelegt: OWNER_INITIAL_PASSWORD ist zu kurz (mindestens 8 Zeichen erforderlich).');
    return;
  }

  const hash = await bcrypt.hash(ownerPassword, 12);
  const practiceId = uuidv4();
  const userId = uuidv4();

  db.prepare(
    'INSERT INTO practices (id, name, email, package, account_status) VALUES (?, ?, ?, ?, ?)'
  ).run(practiceId, 'PraxisOnline24 HQ', ownerEmail.toLowerCase(), 'UNLIMITED', 'active');

  db.prepare(
    'INSERT INTO users (id, practice_id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, practiceId, ownerEmail.toLowerCase(), hash, 'Owner', 'Admin', 'admin');

  console.log(`[db] Owner-Account angelegt: ${ownerEmail}`);
}

async function initDatabase() {
  const wasmBinary = fs.readFileSync(path.join(__dirname, 'node_modules/sql.js/dist/sql-wasm.wasm'));
  const SQL = await initSqlJs({ wasmBinary });

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  const db = new DB(sqlDb);

  db._db.run('PRAGMA foreign_keys = ON');

  db._db.exec(`
    CREATE TABLE IF NOT EXISTS practices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      zip TEXT,
      city TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      description TEXT,
      opening_hours TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      practice_id TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'staff',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_id) REFERENCES practices(id)
    );

    CREATE TABLE IF NOT EXISTS practitioners (
      id TEXT PRIMARY KEY,
      practice_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      title TEXT,
      specialty TEXT,
      email TEXT,
      phone TEXT,
      bio TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_id) REFERENCES practices(id)
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      practice_id TEXT NOT NULL,
      practitioner_id TEXT NOT NULL,
      patient_first_name TEXT NOT NULL,
      patient_last_name TEXT NOT NULL,
      patient_email TEXT NOT NULL,
      patient_phone TEXT,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      appointment_type TEXT,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      cancel_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_id) REFERENCES practices(id),
      FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
    );

    CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY,
      practice_id TEXT NOT NULL,
      practitioner_id TEXT,
      patient_first_name TEXT NOT NULL,
      patient_last_name TEXT NOT NULL,
      patient_email TEXT NOT NULL,
      patient_phone TEXT,
      preferred_dates TEXT,
      status TEXT DEFAULT 'waiting',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_id) REFERENCES practices(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      practice_id TEXT NOT NULL,
      practitioner_id TEXT,
      appointment_id TEXT,
      rating INTEGER NOT NULL,
      comment TEXT,
      author_name TEXT,
      visible INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_id) REFERENCES practices(id)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT,
      practice_id TEXT NOT NULL,
      appointment_id TEXT,
      patient_first_name TEXT NOT NULL,
      patient_last_name TEXT NOT NULL,
      patient_address TEXT,
      items TEXT,
      amount REAL NOT NULL,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      invoice_date TEXT NOT NULL,
      due_date TEXT,
      status TEXT DEFAULT 'draft',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_id) REFERENCES practices(id)
    );

    CREATE TABLE IF NOT EXISTS recipe_print_logs (
      id TEXT PRIMARY KEY,
      practice_id TEXT NOT NULL,
      practitioner_id TEXT NOT NULL,
      patient_first_name TEXT NOT NULL,
      patient_last_name TEXT NOT NULL,
      printed_by TEXT,
      printed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (practice_id) REFERENCES practices(id),
      FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT,
      status TEXT DEFAULT 'pending',
      transaction_id TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      practice_id TEXT,
      key TEXT NOT NULL,
      value TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(practice_id, key)
    );

    CREATE TABLE IF NOT EXISTS waitlist_offers (
      id TEXT PRIMARY KEY,
      waitlist_id TEXT NOT NULL,
      appointment_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (waitlist_id) REFERENCES waitlist(id)
    );

    CREATE TABLE IF NOT EXISTS automation_log (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      details TEXT,
      ran_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS practitioner_availability (
      id TEXT PRIMARY KEY,
      practitioner_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      FOREIGN KEY (practitioner_id) REFERENCES practitioners(id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      practice_id TEXT,
      user_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS demo_requests (
      id TEXT PRIMARY KEY,
      practice TEXT NOT NULL,
      contact TEXT NOT NULL,
      email TEXT NOT NULL,
      country TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'neu',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invite_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const alterStatements = [
    "ALTER TABLE practices ADD COLUMN package TEXT DEFAULT 'BASIC'",
    "ALTER TABLE practices ADD COLUMN language TEXT DEFAULT 'de'",
    "ALTER TABLE practices ADD COLUMN trial_end_date TEXT",
    "ALTER TABLE practices ADD COLUMN account_status TEXT DEFAULT 'active'",
    "ALTER TABLE waitlist ADD COLUMN language TEXT DEFAULT 'de'",
    "ALTER TABLE waitlist ADD COLUMN preferred_period TEXT",
    "ALTER TABLE appointments ADD COLUMN review_mail_sent INTEGER DEFAULT 0",
    "ALTER TABLE appointments ADD COLUMN patient_language TEXT DEFAULT 'de'",
    "ALTER TABLE demo_requests ADD COLUMN phone TEXT",
    "ALTER TABLE demo_requests ADD COLUMN language TEXT DEFAULT 'de'",
    "ALTER TABLE demo_requests ADD COLUMN invited_user_id TEXT",
    // Sprache am Invite-Token speichern, damit /i/<token> beim Redirect
    // die richtige Sprache kennt – ohne dass der Mail-Link selbst noch eine
    // ?lang=…-Query-String tragen muss (Mobile-Mail-Clients brechen daran).
    "ALTER TABLE invite_tokens ADD COLUMN language TEXT DEFAULT 'de'",
  ];

  for (const sql of alterStatements) {
    try {
      db._db.exec(sql);
    } catch {
      // column already exists
    }
  }

  db._save();
  await ensureOwnerAccount(db);
  return db;
}

let _instance = null;

function getDb() {
  if (!_instance) throw new Error('Datenbank noch nicht initialisiert');
  return _instance;
}

async function init() {
  _instance = await initDatabase();
  return _instance;
}

module.exports = { init, getDb };

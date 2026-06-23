-- ============================================================================
--  cleanup-test-account.sql
--  Manueller Einmal-Cleanup für einen einzelnen Test-Account.
--  Löscht in FK-konformer Reihenfolge:
--    invite_tokens  →  password_reset_tokens  →  demo_requests  →  users  →  practices
-- ============================================================================
--
--  WANN VERWENDEN
--    Nach einem Live-Test der Demo-Anfrage (POST /api/demo) bleibt der per
--    Auto-Onboarding angelegte User + Practice in der DB liegen. Dieses Script
--    räumt einen einzelnen Test-Datensatz wieder weg.
--
--  WIE VERWENDEN (auf Render)
--    1. Render Dashboard → Service `praxisonline24` → Shell öffnen
--    2. App stoppen (kritisch! siehe Risiko unten) oder Off-Peak-Zeit nutzen
--    3. cd /opt/render/project/src && sqlite3 data/praxisonline24.db
--    4. .read scripts/cleanup-test-account.sql       (oder Inhalt einfügen)
--    5. Zuerst läuft alles in einer Transaktion mit ROLLBACK → Dry-Run.
--       SELECT-Outputs prüfen.
--    6. Wenn ok: am Ende `ROLLBACK;` durch `COMMIT;` ersetzen und erneut .read
--
--  ⚠️ RISIKO: APP LÄUFT WÄHREND DES SCHREIBENS
--    Die App nutzt sql.js und hält die gesamte DB im RAM. Bei jedem write
--    überschreibt sie data/praxisonline24.db komplett. Wenn die App während
--    deines COMMIT noch läuft und z.B. eine neue Demo-Anfrage reinkommt,
--    werden deine Änderungen wieder überschrieben.
--    → Vor COMMIT die App pausieren oder Service kurz auf Maintenance setzen.
--
--  ⚠️ NIE EXECUTEN OHNE VORHER E-MAIL UNTEN ANZUPASSEN
--    Standardmäßig ist test+demo@praxisonline24.com eingetragen.
--
-- ============================================================================

-- Sicherheit: FK-Checks aktiv, damit Reihenfolge-Fehler sofort auffallen.
PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- ──────────────────────────────────────────────────────────────────────────────
-- 1) Cleanup-Ziel definieren
--    CHECK verhindert, dass versehentlich OWNER_EMAIL als Ziel gesetzt wird.
--    INSERT würde dann mit "CHECK constraint failed" abbrechen.
-- ──────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS _cleanup_target;
CREATE TEMP TABLE _cleanup_target (
  email TEXT NOT NULL CHECK (
    LOWER(email) != 'housniadmy@yahoo.de'      -- OWNER_EMAIL nie löschen
  )
);

-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- HIER die Test-E-Mail eintragen (eine pro Cleanup-Lauf):
INSERT INTO _cleanup_target(email) VALUES (LOWER('test+demo@praxisonline24.com'));
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- ──────────────────────────────────────────────────────────────────────────────
-- 2) Betroffene IDs einfrieren, damit sie nach den DELETEs noch verfügbar sind.
-- ──────────────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS _cleanup_user_ids;
CREATE TEMP TABLE _cleanup_user_ids AS
  SELECT id, practice_id
  FROM users
  WHERE LOWER(email) IN (SELECT email FROM _cleanup_target);

-- Nur Practices vormerken, an denen KEIN anderer User mehr hängt
-- (verhindert, dass eine produktive Praxis gelöscht wird, falls dort später
-- weitere Nutzer eingeladen wurden).
DROP TABLE IF EXISTS _cleanup_practice_ids;
CREATE TEMP TABLE _cleanup_practice_ids AS
  SELECT DISTINCT practice_id AS id
  FROM _cleanup_user_ids
  WHERE practice_id IS NOT NULL
    AND practice_id NOT IN (
      SELECT practice_id
      FROM users
      WHERE practice_id IS NOT NULL
        AND id NOT IN (SELECT id FROM _cleanup_user_ids)
    );

-- ============================================================================
--  CLEANUP — pro Tabelle: erst SELECT (Kontrolle), dann DELETE.
--  Reihenfolge folgt FK-Abhängigkeiten: Children zuerst, Parents zuletzt.
-- ============================================================================

.print ''
.print '── Ziel-E-Mails ───────────────────────────────────────────────'
SELECT email FROM _cleanup_target;

-- ── 1) invite_tokens (FK → users.id) ───────────────────────────────
.print ''
.print '── SELECT invite_tokens ──'
SELECT id, user_id, expires_at, used, created_at
FROM invite_tokens
WHERE user_id IN (SELECT id FROM _cleanup_user_ids);

.print '── DELETE invite_tokens ──'
DELETE FROM invite_tokens
WHERE user_id IN (SELECT id FROM _cleanup_user_ids);
SELECT changes() AS removed_invite_tokens;

-- ── 2) password_reset_tokens (FK → users.id) ───────────────────────
.print ''
.print '── SELECT password_reset_tokens ──'
SELECT id, user_id, expires_at, used, created_at
FROM password_reset_tokens
WHERE user_id IN (SELECT id FROM _cleanup_user_ids);

.print '── DELETE password_reset_tokens ──'
DELETE FROM password_reset_tokens
WHERE user_id IN (SELECT id FROM _cleanup_user_ids);
SELECT changes() AS removed_password_reset_tokens;

-- ── 3) demo_requests (kein echter FK, nur Email-Match) ─────────────
.print ''
.print '── SELECT demo_requests ──'
SELECT id, practice, contact, email, status, created_at
FROM demo_requests
WHERE LOWER(email) IN (SELECT email FROM _cleanup_target);

.print '── DELETE demo_requests ──'
DELETE FROM demo_requests
WHERE LOWER(email) IN (SELECT email FROM _cleanup_target);
SELECT changes() AS removed_demo_requests;

-- ── 4) users (FK → practices.id; Parent für invite_tokens & pwd_reset) ──
.print ''
.print '── SELECT users ──'
SELECT id, email, practice_id, role, active, created_at
FROM users
WHERE id IN (SELECT id FROM _cleanup_user_ids);

.print '── DELETE users ──'
DELETE FROM users
WHERE id IN (SELECT id FROM _cleanup_user_ids);
SELECT changes() AS removed_users;

-- ── 5) practices (Parent für users) ────────────────────────────────
--    Nur Praxen, an denen kein anderer User mehr hängt → schützt
--    versehentlich verknüpfte produktive Daten.
.print ''
.print '── SELECT practices (nur ohne weitere User) ──'
SELECT id, name, email, package, account_status, created_at
FROM practices
WHERE id IN (SELECT id FROM _cleanup_practice_ids);

.print '── DELETE practices ──'
DELETE FROM practices
WHERE id IN (SELECT id FROM _cleanup_practice_ids);
SELECT changes() AS removed_practices;

-- ============================================================================
--  VERIFY — nach den DELETEs Restbestände prüfen (sollte alles 0 sein).
-- ============================================================================

.print ''
.print '── Verify (sollte überall 0 sein) ─────────────────────────────'
SELECT
  (SELECT COUNT(*) FROM users          WHERE LOWER(email) IN (SELECT email FROM _cleanup_target)) AS users_left,
  (SELECT COUNT(*) FROM demo_requests  WHERE LOWER(email) IN (SELECT email FROM _cleanup_target)) AS demos_left,
  (SELECT COUNT(*) FROM invite_tokens  WHERE user_id IN (SELECT id FROM _cleanup_user_ids))       AS invite_tokens_left,
  (SELECT COUNT(*) FROM password_reset_tokens
                                       WHERE user_id IN (SELECT id FROM _cleanup_user_ids))       AS pwd_resets_left,
  (SELECT COUNT(*) FROM practices      WHERE id IN (SELECT id FROM _cleanup_practice_ids))        AS practices_left;

-- ============================================================================
--  FINALE — Standard ROLLBACK (Dry-Run).
--  Wenn die Previews + Verify ok sind: ROLLBACK in COMMIT ändern und erneut
--  .read scripts/cleanup-test-account.sql aufrufen.
-- ============================================================================

ROLLBACK;
-- COMMIT;          -- ← erst aktivieren, wenn die Previews/Verify-Werte stimmen

DROP TABLE IF EXISTS _cleanup_target;
DROP TABLE IF EXISTS _cleanup_user_ids;
DROP TABLE IF EXISTS _cleanup_practice_ids;

# 04 — Technical Documentation

## Purpose

Complete engineering-oriented description of the codebase for the buyer's technical evaluator (in-house engineer, CTO, or contracted reviewer). Answers the question *"What am I inheriting, and how quickly can my team pick it up?"*

## Files that will be added

- `technical-due-diligence.md` — Master document (superset of `sale/Technical_Due_Diligence.md`)
- `stack-overview.md` — Node.js 18+, Express 4.18, sql.js 1.12, bcrypt, pdfkit, node-cron, Brevo API — versions and rationale
- `module-map.md` — walk-through of every `routes/*.js` file, what it does, dependencies
- `code-quality-report.md` — inline documentation quality, comment coverage, dead-code audit, cyclomatic complexity per module
- `dependency-audit.md` — full `npm ls` output + licence audit + `npm audit --production` findings + upgrade path
- `known-limits-and-tech-debt.md` — SQLite ceiling, in-memory sessions, no test suite, deprecated `moment` — all honestly stated with remediation estimates

## NDA classification

**Share after NDA.** Contains implementation detail that competitors could use to reverse-engineer the product. Provided upon signed mutual NDA. Full source-code access is separate and typically granted via time-limited GitHub read invite after LOI.

## Reader notes

- The technical documentation reflects the **repository at the DD revision date**, not necessarily the currently-deployed version. Check `git log` for actual deployment state.
- No hidden dependencies. If a package is not in `package.json`, it's not in the code.
- Third-party licences audit is available on request — all direct dependencies are permissively licensed (MIT / Apache 2.0 / ISC). No copyleft.

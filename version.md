# Version History

This project follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR** — breaking changes: removed/renamed routes or response shapes, incompatible config changes, anything that requires callers or ops to change how they integrate.
- **MINOR** — backward-compatible feature or behavior changes: new endpoints, new reports, meaningful changes to existing behavior (e.g. disabling a pool, restructuring a retry mechanism) that don't break existing callers.
- **PATCH** — backward-compatible bug/error fixes: crash fixes, incorrect query fixes, config corrections, tuning values.

No git tags or version bumps existed before this file. The **Historical** section below summarizes prior commits (all shipped under the untracked `1.0.0` in `package.json`) for context. Formal version tracking starts at `1.0.1`.

---

## [1.0.1] - 2026-08-12

### Fixed
- Oracle pool restart no longer tears down all pools (TMC, TMC_CRON) on a single pool's recoverable error — `restartPool(name)` now rebuilds only the pool that actually failed, instead of the previous `restartPools()` which rebuilt every pool at once (`config/oradbconfig.js`, `config/oracleExecutor.js`).
- `startHealthMonitor()` ran every 1 minute despite a comment saying "every 10 minutes" — interval corrected to actually run every 10 minutes (`config/oradbconfig.js`).
- `scheduleRestart()` used to skip a pool's restart entirely and wait a full 3 hours for the next attempt if the pool was busy at the scheduled time — a continuously busy pool could go without a restart indefinitely. It now retries every 5 minutes until an idle window is found.
- `waitUntilIdle()` is now scoped per pool name (was global), so restarting one pool no longer waits on unrelated activity in another pool.

### Changed
- `TMC_CRON` pool `poolMax` reduced from `10` to `5`, lowering the app's total Oracle session budget (was up to 20 concurrent sessions between TMC + TMC_CRON on the same connect string/user).
- KMC pool disabled (commented out, not deleted) in `config/oradbconfig.js` and `config/oracleExecutor.js` — not currently in use. **Note:** `POST /api/procedureList/procedure` (`api/ProcedureList/procedure.service.js`) still calls the now-disabled `executeKmc` and will throw `executeKmc is not a function` if hit; that route was intentionally left unchanged pending a decision on that endpoint.

---

## Historical (pre-tracking, shipped as 1.0.0)

### 2026-07 — ABHA, procedure reporting, oracle config
- `f177dae` (2026-07-08) oracle config corrected
- `4310fc0` (2026-07-02) Med Service changed
- `7004699` (2026-06-25) new changes in the oracle restart config / server
- `8f142b7` (2026-06-25) detailed report for procedure added
- `d4c3f74` (2026-06-25) ABHA updation
- `8591578` (2026-06-24) conflict clear and code updated
- `abebc81` (2026-07-09) changes in the rol updation query
- `a94a49a` (2026-07-09) error in the medlab config file
- `5b69800` (2026-07-10) changes in the admission utils file

### 2026-05 to 2026-06 — Oracle pool auto-restart, billing report fixes
- `5e4b344` (2026-06-09) session restart completed
- `0b348dd` (2026-06-06) credit insurance bill collection report corrected
- `45f5cbf` (2026-06-03) new updates
- `73c5637` (2026-06-02) unsettled amount detailed bill completed
- `f91861a` (2026-05-29) advance collection and unsettled corrected
- `4932233` (2026-05-28) pool restart every 3 hours
- `0cfce1f` (2026-05-26) oracle config auto-restart at midnight implemented
- `9cd4079` (2026-05-23) HIS error corrected

### 2026-04 — Server/dev fixes, IP discount + collection corrections
- `7cb004e` (2026-04-18) credit insurance bill collection error corrected
- `25f1337` (2026-04-16) changes in the dev server
- `d0e8d00` (2026-04-16) changes in the server
- `9f029f8` / `261caf0` (2026-04-13) error / delete corrections, IP previous day discount error corrected
- `2849e3d` (2026-04-11) error in IP previous day collection corrected
- `a1adffa` (2026-04-11) cron logger table conflict corrected
- `3d0228e` (2026-04-11) console clear in the cron page
- `994370c` (2026-04-11) error corrected in the server for live correction
- `4497918` (2026-04-10) conflict corrected on updation of new MIS in HIS clone
- `4cb1272` (2026-04-10) hospital income report completed

### 2026-03 — Initial MIS/reports build-out
- `a08ded0` (2026-04-03) reports MIS completed
- `8daa5af` (2026-03-27) QMT completed
- `2a2d82b` (2026-03-19) changes completed for test live

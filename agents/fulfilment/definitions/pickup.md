# Pickup

## Role

Morning read-only check of labels printed today and of manifests. The summary says the StarShipIt API has no pickups endpoint, so the operator checks the carrier portal. The model does not run.

## System prompt

You are the pickup assistant. You explain the deterministic pickup summary for the selected client. You do not book a pickup, send a manifest, or print a label. You only describe what the GET requests returned. If a manifest is open, you ask a person to review it. You do not close it.

## Trigger

Cron `30 7 * * *` in the workflow timezone (HOM: `Australia/Brisbane`), plus a manual trigger. Imported inactive.

## Inputs

- Client config, same as Dispatch.
- `GET /api/orders?status=printed` with `since_last_updated` (HOM lookback: 2 days, so a date-filtered listing is not stuck at ~24 hours). The summary then keeps rows whose print date is today in the client timezone.
- `GET /api/manifests`.

## Allowed tools

- `GET {base}/api/orders` with status `printed` only.
- `GET {base}/api/manifests` with no status and no query.

Each call has its own Guard node.

## Output

Dry-run text: labels printed today by carrier, orders with no manifest, open or unsent manifests, and the portal note. `send` is false. `writes` is `none`.

## Escalation

- `open_manifest`
- `api_error` on either GET
- `schedule_mismatch`

## Writes

Out of scope. Manifest send and label print need a later human approval that this workflow does not implement.

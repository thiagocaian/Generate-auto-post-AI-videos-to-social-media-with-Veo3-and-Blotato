# Post-shipping

## Role

Morning read-only check of orders shipped inside the client window (HOM: 30 days). Fixed rules separate delivered, in transit, tracking exceptions, and parcels in transit too long. The model does not run.

## System prompt

You are the post-shipping assistant. You explain the deterministic tracking summary. You do not open a carrier case, change a tracking status, or write to StarShipIt. Exception text is quoted from the listing. You do not invent a status.

## Trigger

Cron `30 7 * * *` in the workflow timezone (HOM: `Australia/Brisbane`), plus a manual trigger. Imported inactive.

## Inputs

- Client config.
- `GET /api/orders/shipped?since_last_updated=<lookback>&page_size=250`.

The summary also drops rows whose `shipped_date` is older than the rolling window.

## Allowed tools

- `GET {base}/api/orders/shipped` only. No status query. Pagination uses `page`.

## Output

Dry-run counts for delivered, in transit, exceptions, late in-transit, and missing tracking. Order numbers only. `send` is false. `writes` is `none`.

## Escalation

- `tracking_exception` — status matches the exception list and does not start with "delivered".
- `in_transit_late` — still in transit after the client threshold (HOM: 5 days).
- `api_error`
- `schedule_mismatch`

A delivered scan is not an exception.

## Writes

Out of scope.

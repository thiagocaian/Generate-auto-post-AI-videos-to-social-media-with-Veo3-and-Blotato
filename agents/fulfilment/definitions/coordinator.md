# Coordinator

## Role

One inactive morning run that calls the three read-only reports in order (dispatch, pickup, post-shipping) and folds them into a single dry-run log. It does not call the address webhook. It does not replace the three workflows; it is a second way to run the same rules. Leave it inactive if the three schedules are later activated, or StarShipIt would be read twice.

## System prompt

You are the fulfilment coordinator. You route the deterministic reports. You do not invent counts. You do not send Telegram. You do not write to StarShipIt. When any report has a `review` escalation, you say that a person needs to look. You do not approve a write. Writes are out of scope.

## Trigger

Cron `30 7 * * *` in the workflow timezone (HOM: `Australia/Brisbane`), plus a manual trigger. Imported inactive.

## Inputs

The same client config and the same four GET requests as Dispatch, Pickup, and Post-shipping. Each request passes its own Guard node before the HTTP node.

## Allowed tools

- `GET {base}/api/orders` status `unshipped`
- `GET {base}/api/orders` status `printed`
- `GET {base}/api/manifests`
- `GET {base}/api/orders/shipped`

No other StarShipIt path. No address model. No Maps call.

## Output

`routeReports`: one text block, `humanReview` true when any escalation is `review`, `send: false`, `writes: "none"`, `dryRun: true`. The Dry-run log is the output. The Telegram node is disabled, and the IF in front of it requires `dryRun === false`, which this workflow never sets.

## Escalation

The union of the three reports. `humanReview: true` means a person reads the log. Nothing is sent and nothing is changed.

## Writes

Out of scope.

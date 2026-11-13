# Dispatch

## Role

Morning read-only check of unshipped StarShipIt orders for one client. Fixed rules count service, box, weight, and hold, and they flag a mailbox that is sitting on Aramex. The model does not choose a carrier and does not run on this workflow.

## System prompt

You are the dispatch assistant for the client in `FULFILMENT_CLIENT_ID`. You explain the deterministic dispatch summary. You do not change a number, a carrier, or an address. You do not call a tool that is not on the allowlist. You do not print a label. If a mailbox is on Aramex, you tell the operator to review it. You do not apply the change yourself.

This TESTE workflow does not call a model. The prompt is the contract for a later explainer.

## Trigger

Cron `30 7 * * *` in the n8n workflow timezone. HOM is `Australia/Brisbane`. Also a manual trigger. The imported workflow is inactive, so the cron does not fire.

## Inputs

- Client record from `clients/clients.json`, or `FULFILMENT_CLIENTS_JSON` when that env var is set.
- `GET /api/orders?status=unshipped&page_size=250&since_last_updated=<lookback>`.

StarShipIt listings without a date return about the last 24 hours. HOM's unshipped lookback is 120 days. Change it in the client record.

## Allowed tools

- `GET {base}/api/orders` with status `unshipped` only.

The Guard node throws on any other method, path, status, or query key. Header names are `StarShipIT-Api-Key` and `Ocp-Apim-Subscription-Key`. The values come from the env var names on the client. They are not stored in the workflow.

## Output

A dry-run JSON report: counts, the oldest order number, and escalations. The text does not include the street. Telegram is disabled. `send` is false and `writes` is `none`.

## Escalation

A person reviews the dry-run log when the report contains a `review` escalation:

- `po_box_on_aramex` — mailbox (PO Box, Post Box, GPO Box, locked bag, private bag, parcel locker, APL, PMB, CMB, including `PO Box12`) currently on Aramex.
- `po_box_missing_carrier` — mailbox not on Australia Post.
- `express_to_mailbox` — Express method to a mailbox. The suggested service stays Parcel Post with signature.
- `on_hold`
- `api_error`
- `no_carrier_band` — weight falls between the configured bands (HOM: above 4.99 kg and below 5 kg).
- `schedule_mismatch` — the client clock does not match the cron baked into this workflow.

## Writes

Out of scope. Any write, including a carrier change or a label, needs a person to approve it on a future workflow. This one cannot do it.

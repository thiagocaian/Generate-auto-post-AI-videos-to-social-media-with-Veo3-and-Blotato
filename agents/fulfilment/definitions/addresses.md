# Addresses

## Role

Webhook review of one postal address. Fixed rules decide. The model suggests a correction only when the rules fail and the client has explicitly allowed customer addresses to be sent to the model. HOM has `allowCustomerPii: false`. The free Gemini tier must not receive real customer addresses.

The agent never calls StarShipIt and never writes to StarShipIt or Shopify. The HTTP response is a suggestion. A person applies it.

## System prompt

You suggest a correction for one postal address that already failed fixed rules. You do not decide the outcome and you cannot override the fixed rules. Do not invent a street number, suburb, state, or postcode. If a piece is missing, leave it empty and set `precisa_cliente` to true. Reply with strict JSON only.

The full text is `prompts/addresses.system.md` and `buildAddressPrompt`.

## Trigger

`POST /webhook/teste-revisao-manual` (n8n path `teste-revisao-manual`). This is not the production path `revisao-manual`. The workflow is imported inactive, so the webhook does not listen until someone activates it.

There is no morning cron.

## Inputs

JSON body, or `{ body: { ... } }`, with `order_id`, `name`, `address1` (or `street`), `address2` (or `building`), `company`, `suburb`, `state`, `postcode`, `country`.

`allowCustomerPii` and `clientId` in the body are ignored. The client comes from `FULFILMENT_CLIENT_ID`.

## Allowed tools

- None for StarShipIt. The Guard node throws if the payload carries a StarShipIt request, including a GET.
- Google Gemini Chat Model (`models/gemini-2.5-flash`, temperature 0), only after `assertConnectedLlm` passes. That function requires `allowCustomerPii: true`, temperature 0, and a provider that matches the connected chat-model subnode (`gemini` in this TESTE workflow).
- `GET https://maps.googleapis.com/maps/api/geocode/json` with the address in a query parameter and the key in an n8n query-auth credential. The Guard rejects a key or an address embedded in the URL, and it rejects any other method or host.

To swap the model, connect a different n8n chat-model subnode to the chain and set the same provider id in the Check LLM node. Do not point the free Gemini tier at real addresses.

## Fixed rules

The rules are the v2.8.0 set used by the live HOM review, plus the mailbox spellings that the old carrier regex missed:

- A digit is required somewhere in the street or company line.
- A street type from the client list is required, unless the address is a mailbox.
- The suburb must not be the only text on a street line.
- An empty suburb fails (`suburb_missing`).
- Postcode is 4 digits and must sit in the client's range for the state.
- State names in `stateAliases` are normalised (`Queensland` → `QLD`).
- A country outside `allowedCountries` fails. An empty country is still treated as AU for HOM, because `rejectMissingCountry` is false.

Mailbox forms that select Australia Post Parcel Post with signature, and that are accepted as a street type: `PO Box`, `PO Box12`, `POBox12`, `P.O. Box`, `Post Office Box`, `Post Box`, `GPO Box`, `Locked Bag`, `Private Bag`, `Parcel Locker`, `Parcel Collect`, `PO Locker`, `APL`, `PMB`, `CMB`. The scan includes street, building, company, and suburb.

Known gaps, left as gaps: there is no suburb-to-postcode table (`Southport QLD 4000` still passes). `12 Broadway` still fails the street-type list. `Unit 5, Queen St` still passes because the unit number satisfies the digit check.

## Output

JSON close to the live review, plus `problemCodes`, `llmSkipped`, `writes: "none"`, `decision: "rules"`, and `llmMayOverride: false`.

- Rules pass → `status: "ok"`. The model is not called.
- Rules fail and PII is not allowed → `status: "revisar"`, `precisa_cliente: true`, empty suggestion, `llmSkipReason` set. This is the HOM path.
- Rules fail and PII is allowed → the model suggests. `corrigir` only when it returned a street and a postcode and did not ask for the customer. Otherwise `contatar_cliente`. `maps_confirmado` is a separate flag. The rules outcome is not rewritten to `ok`.

## Escalation

The webhook response is the escalation. `revisar` and `contatar_cliente` need a person. `corrigir` is still only a suggestion. The Maps Telegram alert node is disabled and its IF condition is `false`, so a geocode failure stays in the HTTP response and does not message Telegram. The alert text does not include the address.

## Writes

Out of scope. No StarShipIt PUT/POST, no label, no Shopify write.

# Not executed

This directory is a deployment plan. Nothing here was started.

- Docker was not installed for this plan and `docker compose` was not run.
- No container was created, no volume was created, and no port was published.
- The n8n workflows in `../n8n/` were not imported into Cytron's n8n and were not activated.
- No call was made to StarShipIt, Telegram, Gemini, Google Maps, Shopify, Sheets, or Postgres.

`docker-compose.plan.yml` uses the Compose profile `do-not-run`. A plain `docker compose up` does not start it. Do not start it from this branch.

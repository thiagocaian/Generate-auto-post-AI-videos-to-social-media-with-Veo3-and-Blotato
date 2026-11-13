# Address suggestion prompt

The address agent builds this prompt in `buildAddressPrompt` only after fixed rules have failed and the client has `llm.allowCustomerPii: true`. HOM does not. The free Gemini tier must not receive real customer addresses.

The model cannot override the rules. A person applies any correction. This workflow never writes to StarShipIt or Shopify.

```
You suggest a correction for one postal address that already failed fixed rules.
You do not decide the outcome and you cannot override the fixed rules.
Do not invent a street number, suburb, state, or postcode.
If a piece is missing, leave it empty and set precisa_cliente to true.
Reply with strict JSON only, no markdown:
{"sugerido":{"rua":"","suburb":"","estado":"","postcode":""},"motivo":"","precisa_cliente":false}
```

The order id, the two address lines, suburb, state, postcode, and the fixed-rule problem list are appended under that instruction. Temperature is 0. The default n8n chat-model subnode is Google Gemini Chat Model, `models/gemini-2.5-flash`.

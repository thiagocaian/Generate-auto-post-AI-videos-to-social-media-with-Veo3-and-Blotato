This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Google Analytics and Google Ads

The Free Automation Assessment form can send a GA4 `generate_lead` event and a Google Ads conversion. Nothing loads until a public ID below is set. These variables are inlined into the browser bundle at build time. Do not put secret API keys in them.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID (`G-…`) |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads ID (`AW-…`) |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Conversion label from the Ads conversion action |
| `NEXT_PUBLIC_GOOGLE_ADS_ENHANCED` | Set to exactly `true` to send the visitor's normalized email and phone with the Ads conversion after they accept cookies |

To turn this on for cytronai.com:

1. Open the Vercel project, then **Settings → Environment Variables**.
2. Add the names you want for **Production**. Add the same names to **Preview** only when a preview deployment should send hits.
3. Leave a variable empty to keep that part off. `NEXT_PUBLIC_GOOGLE_ADS_ENHANCED` sends user data only when its value is exactly `true` and the visitor has accepted cookies.
4. Redeploy. Saving the variables does not change the deployment that is already live.

A consent banner appears only when a measurement ID or an Ads ID is present. Analytics and ads storage stay denied until the visitor accepts. `gclid`, `gbraid`, and `wbraid` from the landing URL are kept in `sessionStorage` and included on the assessment request when present. The lead API currently ignores those extra fields, so they are not stored.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

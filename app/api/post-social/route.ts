import { NextRequest, NextResponse } from "next/server";

// Blotato API — publishes video to social media platforms
// Docs: https://help.blotato.com/api/start

const BLOTATO_API = "https://backend.blotato.com";

type Platform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "linkedin"
  | "facebook"
  | "threads";

interface PostPayload {
  videoUrl: string;
  caption: string;
  platforms: Platform[];
  scheduledTime?: string; // ISO 8601 — omit to post immediately
  useNextFreeSlot?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, caption, platforms, scheduledTime, useNextFreeSlot }: PostPayload =
      await req.json();

    if (!videoUrl || !caption || !platforms?.length) {
      return NextResponse.json(
        { error: "videoUrl, caption and platforms are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BLOTATO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing BLOTATO_API_KEY" }, { status: 500 });
    }

    // 1. Fetch connected accounts to get accountIds
    const accountsRes = await fetch(`${BLOTATO_API}/v2/users/me/accounts`, {
      headers: { "api-key": apiKey },
    });

    if (!accountsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch Blotato accounts" }, { status: 502 });
    }

    const accounts = await accountsRes.json();

    // 2. Post to each requested platform
    const results = await Promise.allSettled(
      platforms.map(async (platform) => {
        // For TikTok, prefer the Cytron account if available
        const account =
          platform === "tiktok"
            ? (accounts.find(
                (a: { platform: string; name?: string; username?: string }) =>
                  a.platform === "tiktok" &&
                  (a.name?.toLowerCase().includes("cytron") ||
                    a.username?.toLowerCase().includes("cytron"))
              ) ??
              accounts.find((a: { platform: string }) => a.platform === "tiktok"))
            : accounts.find((a: { platform: string }) => a.platform === platform);

        if (!account) {
          throw new Error(`No connected account for platform: ${platform}`);
        }

        const body: Record<string, unknown> = {
          accountId: account.id,
          text: caption,
          mediaUrls: [videoUrl],
          useNextFreeSlot: useNextFreeSlot ?? true,
        };

        if (scheduledTime) {
          body.scheduledTime = scheduledTime;
          delete body.useNextFreeSlot;
        }

        // Instagram — mark as reel
        if (platform === "instagram") body.videoUploadType = "reel";

        // TikTok — Cytron account settings
        if (platform === "tiktok") {
          body.isAiGenerated = true;
          body.privacyLevel = "PUBLIC_TO_EVERYONE";
          body.disabledComments = false;
          body.disabledDuet = false;
          body.disabledStitch = false;
          body.title = caption.slice(0, 150); // TikTok title max 150 chars
        }

        const postRes = await fetch(`${BLOTATO_API}/v2/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify(body),
        });

        if (!postRes.ok) {
          const err = await postRes.text();
          throw new Error(`Blotato post failed for ${platform}: ${err}`);
        }

        const data = await postRes.json();
        return { platform, postSubmissionId: data.postSubmissionId, status: "queued" };
      })
    );

    const successes = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<unknown>).value);

    const failures = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message);

    return NextResponse.json({ successes, failures });
  } catch (err) {
    console.error("Post social error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

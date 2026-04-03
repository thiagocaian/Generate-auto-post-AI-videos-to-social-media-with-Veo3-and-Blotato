import { NextRequest, NextResponse } from 'next/server'

const BLOTATO_API = 'https://backend.blotato.com/v2'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { imageUrl, caption, platforms } = body

  const apiKey = process.env.BLOTATO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'BLOTATO_API_KEY not configured' }, { status: 500 })
  }

  if (!imageUrl || !caption || !platforms?.length) {
    return NextResponse.json({ error: 'Missing required fields: imageUrl, caption, platforms' }, { status: 400 })
  }

  // 1. Fetch connected Blotato accounts
  let accounts: { id: string; platform: string; username: string }[] = []
  try {
    const accRes = await fetch(`${BLOTATO_API}/users/me/accounts`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const accData = await accRes.json()
    accounts = accData.items || []
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch Blotato accounts' }, { status: 500 })
  }

  // 2. Post to each requested platform
  const successes: { platform: string; postSubmissionId: string }[] = []
  const failures: { platform: string; error: string }[] = []

  for (const platform of platforms) {
    const account = accounts.find(a => a.platform === platform)
    if (!account) {
      failures.push({ platform, error: `No ${platform} account connected in Blotato` })
      continue
    }

    // Build platform-specific post payload
    const postPayload: Record<string, unknown> = {
      accountId: account.id,
      content: {
        text: caption,
        mediaUrls: [imageUrl],
        platform,
      },
      target: {
        targetType: platform,
      },
    }

    // TikTok requires extra fields
    if (platform === 'tiktok') {
      (postPayload.target as Record<string, unknown>).privacyLevel = 'PUBLIC_TO_EVERYONE';
      (postPayload.target as Record<string, unknown>).disabledComments = false;
      (postPayload.target as Record<string, unknown>).disabledDuet = false;
      (postPayload.target as Record<string, unknown>).disabledStitch = false;
      (postPayload.target as Record<string, unknown>).isBrandedContent = false;
      (postPayload.target as Record<string, unknown>).isYourBrand = false;
      (postPayload.target as Record<string, unknown>).isAiGenerated = true
    }

    try {
      const postRes = await fetch(`${BLOTATO_API}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post: postPayload }),
      })

      const postData = await postRes.json()

      if (postRes.ok && postData.postSubmissionId) {
        successes.push({ platform, postSubmissionId: postData.postSubmissionId })
      } else {
        failures.push({ platform, error: postData.message || 'Post failed' })
      }
    } catch (err) {
      failures.push({ platform, error: err instanceof Error ? err.message : 'Network error' })
    }
  }

  return NextResponse.json({
    successes,
    failures,
    totalPosted: successes.length,
    totalFailed: failures.length,
  })
}

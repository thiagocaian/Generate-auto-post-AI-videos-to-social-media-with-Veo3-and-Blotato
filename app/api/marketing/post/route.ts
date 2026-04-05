import { NextRequest, NextResponse } from 'next/server'

const OUTSTAND_API = 'https://api.outstand.so/v1'
const BLOTATO_API = 'https://backend.blotato.com/v2'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { imageUrl, caption, platforms } = body

  // Try Outstand first (faster, <200ms), fall back to Blotato
  const outstandKey = process.env.OUTSTAND_API_KEY
  const blotaloKey = process.env.BLOTATO_API_KEY

  if (!outstandKey && !blotaloKey) {
    return NextResponse.json({ error: 'No posting API key configured' }, { status: 500 })
  }

  if (!imageUrl || !caption || !platforms?.length) {
    return NextResponse.json({ error: 'Missing required fields: imageUrl, caption, platforms' }, { status: 400 })
  }

  // === OUTSTAND (primary — instant posting) ===
  if (outstandKey) {
    try {
      // 1. Get connected social accounts
      const accRes = await fetch(`${OUTSTAND_API}/social-accounts`, {
        headers: { Authorization: `Bearer ${outstandKey}` },
      })
      const accData = await accRes.json()
      const accounts = accData.data || []
      console.log('[POST] Outstand accounts:', accounts.length, accounts.map((a: { platform: string }) => a.platform))

      if (accounts.length > 0) {
        // 2. Find matching accounts for requested platforms
        const matchedIds: string[] = []
        for (const platform of platforms) {
          const account = accounts.find((a: { platform: string; id: string }) =>
            a.platform?.toLowerCase() === platform.toLowerCase()
          )
          if (account) matchedIds.push(account.id)
        }

        if (matchedIds.length > 0) {
          // 3. Create post via Outstand
          const postBody = {
            containers: [{
              content: caption,
              mediaUrls: [imageUrl],
            }],
            socialAccountIds: matchedIds,
          }
          console.log('[POST] Outstand posting to', matchedIds.length, 'accounts, mediaUrl:', imageUrl?.substring(0, 80))
          const postRes = await fetch(`${OUTSTAND_API}/posts`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${outstandKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(postBody),
          })
          const postData = await postRes.json()
          console.log('[POST] Outstand response:', postRes.status, JSON.stringify(postData).substring(0, 300))

          if (postRes.ok && postData.success) {
            return NextResponse.json({
              successes: matchedIds.map((id, i) => ({ platform: platforms[i] || 'unknown', postId: postData.data?.id || id })),
              failures: [],
              totalPosted: matchedIds.length,
              totalFailed: 0,
              provider: 'outstand',
            })
          } else {
            console.log('[POST] Outstand post failed, falling through to Blotato. Status:', postRes.status, 'Data:', JSON.stringify(postData))
          }
        } else {
          console.log('[POST] Outstand: no matching accounts for platforms:', platforms)
        }
      }
      // If Outstand has no accounts or failed, fall through to Blotato
    } catch (err) {
      console.log('[POST] Outstand error, falling through to Blotato:', err instanceof Error ? err.message : err)
    }
  }

  // === BLOTATO (fallback) ===
  if (!blotaloKey) {
    return NextResponse.json({ error: 'No accounts connected in Outstand and no Blotato key configured' }, { status: 500 })
  }

  // 1. Fetch connected Blotato accounts
  let accounts: { id: string; platform: string; username: string }[] = []
  try {
    const accRes = await fetch(`${BLOTATO_API}/users/me/accounts`, {
      headers: { Authorization: `Bearer ${blotaloKey}` },
    })
    const accData = await accRes.json()
    accounts = accData.items || []
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Blotato accounts' }, { status: 500 })
  }

  // 2. Upload media to Blotato storage first
  let mediaUrl = imageUrl
  try {
    console.log('[POST] Blotato: uploading media from:', imageUrl?.substring(0, 80))
    const uploadRes = await fetch(`${BLOTATO_API}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${blotaloKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: imageUrl }),
    })
    const uploadData = await uploadRes.json()
    console.log('[POST] Blotato media upload response:', uploadRes.status, JSON.stringify(uploadData).substring(0, 200))
    if (uploadData.url) mediaUrl = uploadData.url
  } catch (err) {
    console.log('[POST] Blotato media upload failed:', err instanceof Error ? err.message : err)
  }

  // 3. Post to each platform
  const successes: { platform: string; postSubmissionId: string }[] = []
  const failures: { platform: string; error: string }[] = []

  for (const platform of platforms) {
    const account = accounts.find(a => a.platform === platform)
    if (!account) {
      failures.push({ platform, error: `No ${platform} account connected` })
      continue
    }

    const postPayload: Record<string, unknown> = {
      accountId: account.id,
      content: { text: caption, mediaUrls: [mediaUrl], platform },
      target: { targetType: platform },
    }

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
      console.log('[POST] Blotato: posting to', platform, 'account:', account.id, 'mediaUrl:', mediaUrl?.substring(0, 80))
      const postRes = await fetch(`${BLOTATO_API}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${blotaloKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: postPayload }),
      })
      const postData = await postRes.json()
      console.log('[POST] Blotato post response:', postRes.status, JSON.stringify(postData).substring(0, 300))
      if (postRes.ok && postData.postSubmissionId) {
        successes.push({ platform, postSubmissionId: postData.postSubmissionId })
      } else {
        failures.push({ platform, error: postData.message || postData.error || `API returned ${postRes.status}: ${JSON.stringify(postData).substring(0, 100)}` })
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
    provider: 'blotato',
  })
}

// PUT — Upload video to Blotato storage (called when video generation completes)
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { videoUrl } = body

  const blotaloKey = process.env.BLOTATO_API_KEY
  if (!blotaloKey || !videoUrl) {
    return NextResponse.json({ permanentUrl: videoUrl })
  }

  try {
    const uploadRes = await fetch(`${BLOTATO_API}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${blotaloKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl }),
    })
    const uploadData = await uploadRes.json()
    return NextResponse.json({ permanentUrl: uploadData.url || videoUrl })
  } catch {
    return NextResponse.json({ permanentUrl: videoUrl })
  }
}

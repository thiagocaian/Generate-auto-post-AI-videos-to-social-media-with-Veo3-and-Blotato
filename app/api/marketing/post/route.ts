import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60 // Allow up to 60s for media upload + posting

const AYRSHARE_API = 'https://app.ayrshare.com/api'
const OUTSTAND_API = 'https://api.outstand.so/v1'
const BLOTATO_API = 'https://backend.blotato.com/v2'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { imageUrl, caption, platforms } = body

  const ayrshareKey = process.env.AYRSHARE_API_KEY
  const outstandKey = process.env.OUTSTAND_API_KEY
  const blotaloKey = process.env.BLOTATO_API_KEY

  if (!ayrshareKey && !outstandKey && !blotaloKey) {
    return NextResponse.json({ error: 'No posting API key configured' }, { status: 500 })
  }

  if (!imageUrl || !caption || !platforms?.length) {
    return NextResponse.json({ error: 'Missing required fields: imageUrl, caption, platforms' }, { status: 400 })
  }

  // Validate media URL is accessible before posting
  let mediaContentType = ''
  try {
    const headRes = await fetch(imageUrl, { method: 'HEAD' })
    if (!headRes.ok) {
      console.log('[POST] Media URL not accessible:', headRes.status, imageUrl?.substring(0, 80))
      return NextResponse.json({
        error: `Media URL is not accessible (${headRes.status}). The video URL may have expired. Please generate a new video.`,
        expired: true
      }, { status: 400 })
    }
    mediaContentType = headRes.headers.get('content-type') || ''
    console.log('[POST] Media URL validated OK:', mediaContentType, headRes.headers.get('content-length'))
  } catch (err) {
    console.log('[POST] Media URL validation failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({
      error: 'Cannot reach media URL. The video may have expired. Please generate a new video.',
      expired: true
    }, { status: 400 })
  }

  const isVideo = mediaContentType.includes('video') || imageUrl.includes('.mp4') || imageUrl.includes('.webm')

  // === AYRSHARE (primary — unified posting) ===
  if (ayrshareKey) {
    try {
      const isVideo = mediaContentType.includes('video') || imageUrl.includes('.mp4') || imageUrl.includes('.webm') || imageUrl.includes('.mov')

      const ayrBody: Record<string, unknown> = {
        post: caption,
        platforms: platforms.map((p: string) => p.toLowerCase()),
        mediaUrls: [imageUrl],
      }

      // Video-specific params
      if (isVideo) {
        ayrBody.isVideo = true
        ayrBody.isPortraitVideo = true // TikTok/Reels format
      }

      const res = await fetch(`${AYRSHARE_API}/post`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ayrshareKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ayrBody),
      })
      const data = await res.json()
      console.log('[POST] Ayrshare response:', res.status, JSON.stringify(data).substring(0, 300))

      if (res.ok && (data.id || data.postIds)) {
        return NextResponse.json({
          successes: platforms.map((p: string) => ({
            platform: p.toLowerCase(),
            postId: data.postIds?.[p.toLowerCase()] || data.id,
          })),
          failures: [],
          totalPosted: platforms.length,
          provider: 'ayrshare',
        })
      }

      // If Ayrshare fails, fall through to Outstand
      console.log('[POST] Ayrshare failed, trying Outstand fallback...')
    } catch (err) {
      console.error('[POST] Ayrshare error:', err)
      // Fall through to Outstand
    }
  }

  // === OUTSTAND (fallback — instant posting) ===
  if (outstandKey) {
    try {
      const accRes = await fetch(`${OUTSTAND_API}/social-accounts`, {
        headers: { Authorization: `Bearer ${outstandKey}` },
      })
      const accData = await accRes.json()
      const accounts = accData.data || []
      console.log('[POST] Outstand accounts:', accounts.length)

      if (accounts.length > 0) {
        const matchedIds: string[] = []
        for (const platform of platforms) {
          const account = accounts.find((a: { platform: string; id: string }) =>
            a.platform?.toLowerCase() === platform.toLowerCase()
          )
          if (account) matchedIds.push(account.id)
        }

        if (matchedIds.length > 0) {
          const postRes = await fetch(`${OUTSTAND_API}/posts`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${outstandKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              containers: [{ content: caption, mediaUrls: [imageUrl] }],
              socialAccountIds: matchedIds,
            }),
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
          }
        }
      }
    } catch (err) {
      console.log('[POST] Outstand error:', err instanceof Error ? err.message : err)
    }
  }

  // === BLOTATO (fallback) ===
  if (!blotaloKey) {
    return NextResponse.json({ error: 'No accounts connected in Outstand and no Blotato key configured' }, { status: 500 })
  }

  // 1. Fetch connected Blotato accounts (using correct auth header)
  let accounts: { id: string; platform: string; username: string }[] = []
  try {
    const accRes = await fetch(`${BLOTATO_API}/users/me/accounts`, {
      headers: { 'blotato-api-key': blotaloKey },
    })
    const accData = await accRes.json()
    accounts = accData.items || []
    console.log('[POST] Blotato accounts:', accounts.map(a => `${a.platform}:${a.username}:${a.id}`))
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Blotato accounts' }, { status: 500 })
  }

  // 2. Upload media to Blotato via presigned URL
  let mediaUrl = imageUrl
  try {
    const ext = isVideo ? 'mp4' : 'jpg'
    const filename = `cytron_${Date.now()}.${ext}`
    console.log('[POST] Blotato: requesting presigned upload for:', filename)

    // Step A: Get presigned URL
    const presignRes = await fetch(`${BLOTATO_API}/media/uploads`, {
      method: 'POST',
      headers: {
        'blotato-api-key': blotaloKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    })
    const presignData = await presignRes.json()
    console.log('[POST] Blotato presign response:', presignRes.status, JSON.stringify(presignData).substring(0, 200))

    if (presignData.presignedUrl && presignData.publicUrl) {
      // Step B: Download the media from source
      const downloadRes = await fetch(imageUrl)
      if (downloadRes.ok) {
        const mediaBuffer = Buffer.from(await downloadRes.arrayBuffer())
        const contentType = downloadRes.headers.get('content-type') || (isVideo ? 'video/mp4' : 'image/jpeg')
        console.log('[POST] Blotato: uploading', Math.round(mediaBuffer.length / 1024), 'KB to presigned URL')

        // Step C: Upload to presigned URL
        const uploadRes = await fetch(presignData.presignedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: mediaBuffer,
        })
        console.log('[POST] Blotato presigned upload status:', uploadRes.status)

        if (uploadRes.ok || uploadRes.status === 200 || uploadRes.status === 204) {
          mediaUrl = presignData.publicUrl
          console.log('[POST] Blotato media uploaded successfully:', mediaUrl.substring(0, 80))
        }
      }
    }
  } catch (err) {
    console.log('[POST] Blotato media upload failed, using direct URL:', err instanceof Error ? err.message : err)
  }

  // 3. Post to each platform with correct payload structure
  const successes: { platform: string; postSubmissionId: string }[] = []
  const failures: { platform: string; error: string }[] = []

  for (const platform of platforms) {
    const account = accounts.find(a => a.platform === platform)
    if (!account) {
      failures.push({ platform, error: `No ${platform} account connected in Blotato` })
      continue
    }

    // Build platform-specific target
    const target: Record<string, unknown> = { targetType: platform }

    if (platform === 'instagram') {
      if (isVideo) {
        target.mediaType = 'reel'
        target.shareToFeed = true
      }
    }

    if (platform === 'tiktok') {
      target.privacyLevel = 'PUBLIC_TO_EVERYONE'
      target.disabledComments = false
      target.disabledDuet = false
      target.disabledStitch = false
      target.isBrandedContent = false
      target.isYourBrand = false
      target.isAiGenerated = true
    }

    const postBody = {
      post: {
        accountId: account.id,
        content: {
          text: caption,
          mediaUrls: [mediaUrl],
          platform,
        },
        target,
      },
    }

    try {
      console.log('[POST] Blotato posting to', platform, '| account:', account.id, '| media:', mediaUrl?.substring(0, 80), '| isVideo:', isVideo)
      console.log('[POST] Blotato payload:', JSON.stringify(postBody).substring(0, 500))

      const postRes = await fetch(`${BLOTATO_API}/posts`, {
        method: 'POST',
        headers: {
          'blotato-api-key': blotaloKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postBody),
      })
      const postData = await postRes.json()
      console.log('[POST] Blotato post response:', postRes.status, JSON.stringify(postData).substring(0, 300))

      if (postRes.ok && postData.postSubmissionId) {
        successes.push({ platform, postSubmissionId: postData.postSubmissionId })
      } else {
        failures.push({ platform, error: postData.message || postData.error || `API ${postRes.status}: ${JSON.stringify(postData).substring(0, 150)}` })
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

// PUT — Upload video to permanent storage (Supabase primary, Blotato presigned fallback)
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { videoUrl } = body

  if (!videoUrl) {
    return NextResponse.json({ permanentUrl: videoUrl })
  }

  console.log('[PUT] Uploading video to permanent storage:', videoUrl?.substring(0, 80))

  // Strategy 1: Upload to Supabase Storage (most reliable)
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const adminClient = createClient(supabaseUrl, supabaseKey)

      await adminClient.storage.createBucket('marketing-uploads', {
        public: true,
        fileSizeLimit: 52428800,
      }).catch(() => {})

      const videoRes = await fetch(videoUrl)
      if (videoRes.ok) {
        const videoBuffer = Buffer.from(await videoRes.arrayBuffer())
        const contentType = videoRes.headers.get('content-type') || 'video/mp4'
        const ext = contentType.includes('mp4') ? 'mp4' : 'webm'
        const fileName = `videos/${Date.now()}.${ext}`

        const { error } = await adminClient.storage
          .from('marketing-uploads')
          .upload(fileName, videoBuffer, { contentType, upsert: true })

        if (!error) {
          const { data: { publicUrl } } = adminClient.storage
            .from('marketing-uploads')
            .getPublicUrl(fileName)
          console.log('[PUT] Supabase permanent URL:', publicUrl)
          return NextResponse.json({ permanentUrl: publicUrl })
        }
        console.log('[PUT] Supabase upload error:', error.message)
      }
    }
  } catch (err) {
    console.log('[PUT] Supabase upload failed:', err instanceof Error ? err.message : err)
  }

  // Strategy 2: Upload to Blotato presigned storage
  const blotaloKey = process.env.BLOTATO_API_KEY
  if (blotaloKey) {
    try {
      const presignRes = await fetch(`${BLOTATO_API}/media/uploads`, {
        method: 'POST',
        headers: {
          'blotato-api-key': blotaloKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: `video_${Date.now()}.mp4` }),
      })
      const presignData = await presignRes.json()

      if (presignData.presignedUrl && presignData.publicUrl) {
        const videoRes = await fetch(videoUrl)
        if (videoRes.ok) {
          const buffer = Buffer.from(await videoRes.arrayBuffer())
          await fetch(presignData.presignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'video/mp4' },
            body: buffer,
          })
          console.log('[PUT] Blotato permanent URL:', presignData.publicUrl)
          return NextResponse.json({ permanentUrl: presignData.publicUrl })
        }
      }
    } catch (err) {
      console.log('[PUT] Blotato upload failed:', err instanceof Error ? err.message : err)
    }
  }

  console.log('[PUT] WARNING: Using original URL (may expire)')
  return NextResponse.json({ permanentUrl: videoUrl, warning: 'Using temporary URL' })
}

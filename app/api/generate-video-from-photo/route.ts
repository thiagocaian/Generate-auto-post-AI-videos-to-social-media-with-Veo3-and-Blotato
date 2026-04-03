import { NextRequest, NextResponse } from 'next/server'

const FAL_API = 'https://queue.fal.run'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { imageUrl, brandConfig, brief } = body

  const openaiKey = process.env.OPENAI_API_KEY
  const falKey = process.env.FAL_KEY
  if (!openaiKey || !falKey) {
    return NextResponse.json({ error: 'Missing API keys (OPENAI_API_KEY or FAL_KEY)' }, { status: 500 })
  }

  const brand = brandConfig || {}
  const productName = brand.product_name || 'Product'
  const brandName = brand.brand || 'Brand'
  const targetAudience = brand.target_audience || 'general audience aged 18-45'
  const style = brand.style || 'cinematic, natural lighting, warm tones, 9:16 vertical'
  const captionTone = brand.caption_tone || 'engaging, authentic, professional'
  const platform = brand.platform || 'instagram,tiktok'

  try {
    // STEP 1: GPT-4o Vision — analyse photo and generate video prompt + caption
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert creative director and social media marketing specialist working with ${brandName}. Create cinematic, scroll-stopping video content for ${productName}, targeting ${targetAudience}. Visual style: ${style}. Caption tone: ${captionTone}.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image and create marketing content for ${platform}. ${brief ? 'Brief: ' + brief : ''}

Return a JSON object with exactly these two fields:
{
  "video_prompt": "A detailed cinematic video generation prompt describing the scene, lighting, camera angles, textures, mood and motion. Apply the visual style specified. Minimum 80 words. Must create scroll-stopping content.",
  "caption": "A ${captionTone} caption for ${platform}. Opens with a strong hook. Builds desire. Ends with a relatable CTA. Includes 3-5 relevant hashtags."
}`,
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 600,
      }),
    })

    const gptData = await gptRes.json()
    if (!gptRes.ok) {
      return NextResponse.json({ error: 'GPT-4o failed: ' + (gptData.error?.message || 'Unknown') }, { status: 500 })
    }

    // Parse the GPT response
    let videoPrompt = ''
    let caption = ''
    try {
      const content = gptData.choices[0].message.content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        videoPrompt = parsed.video_prompt || parsed.image_prompt || ''
        caption = parsed.caption || ''
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse GPT-4o response' }, { status: 500 })
    }

    if (!videoPrompt) {
      return NextResponse.json({ error: 'GPT-4o did not generate a video prompt' }, { status: 500 })
    }

    // STEP 2: Submit video generation to Veo3 Fast (or Kling as fallback)
    const falRes = await fetch(`${FAL_API}/fal-ai/veo3/fast`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: videoPrompt,
        aspect_ratio: '9:16',
        duration: '8s',
      }),
    })

    const falData = await falRes.json()
    if (!falRes.ok || !falData.request_id) {
      // Fallback to Kling v2 image-to-video
      const klingRes = await fetch(`${FAL_API}/fal-ai/kling-video/v2.6/pro/image-to-video`, {
        method: 'POST',
        headers: {
          Authorization: `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: videoPrompt,
          image_url: imageUrl,
          aspect_ratio: '9:16',
          duration: '5',
        }),
      })
      const klingData = await klingRes.json()
      return NextResponse.json({
        requestId: klingData.request_id,
        model: 'kling',
        statusUrl: klingData.status_url,
        caption,
        videoPrompt,
      })
    }

    return NextResponse.json({
      requestId: falData.request_id,
      model: 'veo3-fast',
      statusUrl: falData.status_url,
      responseUrl: falData.response_url,
      caption,
      videoPrompt,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

// GET — poll video generation status using the statusUrl/responseUrl from fal.ai
export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get('requestId')
  const statusUrl = req.nextUrl.searchParams.get('statusUrl')
  const responseUrl = req.nextUrl.searchParams.get('responseUrl')

  if (!requestId && !statusUrl) {
    return NextResponse.json({ error: 'Missing requestId or statusUrl' }, { status: 400 })
  }

  const falKey = process.env.FAL_KEY
  if (!falKey) {
    return NextResponse.json({ error: 'FAL_KEY not configured' }, { status: 500 })
  }

  try {
    // Use the statusUrl directly from fal.ai (most reliable)
    const checkUrl = statusUrl || `${FAL_API}/fal-ai/veo3/fast/requests/${requestId}/status`
    const statusRes = await fetch(checkUrl, {
      headers: { Authorization: `Key ${falKey}` },
    })
    const statusData = await statusRes.json()

    if (statusData.status === 'COMPLETED') {
      // Get the result using responseUrl or construct from statusUrl
      const resultUrl = responseUrl || statusData.response_url || checkUrl.replace('/status', '')
      const resultRes = await fetch(resultUrl, {
        headers: { Authorization: `Key ${falKey}` },
      })
      const resultData = await resultRes.json()
      const videoUrl = resultData.video?.url || resultData.video_url || resultData.data?.video_url
      return NextResponse.json({ status: 'COMPLETED', videoUrl })
    }

    return NextResponse.json({
      status: statusData.status || 'IN_PROGRESS',
      queuePosition: statusData.queue_position,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

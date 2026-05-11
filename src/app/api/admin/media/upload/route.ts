import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // File size check (10 MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 413 })
  }

  // MIME type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP.' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Convert to WebP using Sharp
  let webpBuffer: Buffer
  let finalSizeKb: number

  try {
    const sharp = (await import('sharp')).default
    // Try quality 80 first
    webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer()
    finalSizeKb = Math.round(webpBuffer.length / 1024)

    // If still > 500KB, try quality 60
    if (finalSizeKb > 500) {
      webpBuffer = await sharp(buffer).webp({ quality: 60 }).toBuffer()
      finalSizeKb = Math.round(webpBuffer.length / 1024)
    }

    // If still > 500KB, try quality 40
    if (finalSizeKb > 500) {
      webpBuffer = await sharp(buffer).webp({ quality: 40 }).toBuffer()
      finalSizeKb = Math.round(webpBuffer.length / 1024)
    }

    if (finalSizeKb > 500) {
      return NextResponse.json({ error: 'Image cannot be compressed below 500 KB. Please use a smaller image.' }, { status: 422 })
    }
  } catch {
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 })
  }

  // Get image dimensions
  let width: number | undefined
  let height: number | undefined
  try {
    const sharp2 = (await import('sharp')).default
    const meta = await sharp2(webpBuffer).metadata()
    width = meta.width
    height = meta.height
  } catch { /* dimensions optional */ }

  // Upload to Supabase Storage
  const service = createServiceClient()
  const fileName = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`
  const filePath = `uploads/${fileName}`

  const { error: uploadError } = await service.storage
    .from('media')
    .upload(filePath, webpBuffer, { contentType: 'image/webp', upsert: false })

  if (uploadError) {
    // If bucket doesn't exist, create it
    if (uploadError.message.includes('Bucket not found')) {
      await service.storage.createBucket('media', { public: true })
      const { error: retryError } = await service.storage
        .from('media')
        .upload(filePath, webpBuffer, { contentType: 'image/webp', upsert: false })
      if (retryError) return NextResponse.json({ error: retryError.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
  }

  // Get public URL
  const { data: { publicUrl } } = service.storage.from('media').getPublicUrl(filePath)

  // Save to media_assets table
  const { data: asset } = await service.from('media_assets').insert({
    original_name: file.name,
    webp_url: publicUrl,
    file_size_kb: finalSizeKb,
    width,
    height,
    uploaded_by: user.id,
  }).select().single()

  return NextResponse.json({
    url: publicUrl,
    fileSize: finalSizeKb,
    width,
    height,
    assetId: asset?.id,
  })
}

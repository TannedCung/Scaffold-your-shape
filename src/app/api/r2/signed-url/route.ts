import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ENDPOINT = `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET!;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  const { key } = await req.json();
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }
  try {
    const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
    // 1 hour expiry
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return NextResponse.json({ url: signedUrl });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate signed URL', details: String(e) }, { status: 500 });
  }
}

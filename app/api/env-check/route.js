// app/api/env-check/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    xummKeyLoaded: !!process.env.XUMM_API_KEY,
    xummSecretLoaded: !!process.env.XUMM_API_SECRET,
    emailJsPublicLoaded: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  });
}

// app/api/me/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const jar = await cookies();
  const account = jar.get('xummAccount')?.value || null;
  const hasToken = !!jar.get('xummUserToken')?.value;
  return NextResponse.json({ account, hasToken });
}

// app/api/agents/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import AGENTS_STORE     from '../route';      // re-use the in-memory array

export const dynamic = 'force-dynamic';

export async function DELETE(_, { params }) {
  const jar = cookies();
  if (!jar.get('xummAccount')?.value)
    return NextResponse.json({ error:'Not auth' }, { status:401 });

  const before = AGENTS_STORE.length;
  AGENTS_STORE.splice(0, AGENTS_STORE.length,
    ...AGENTS_STORE.filter(a => a.id !== params.id));

  return NextResponse.json({ removed: before - AGENTS_STORE.length });
}

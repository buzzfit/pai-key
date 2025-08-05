// app/api/agents/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies }      from 'next/headers';
import store            from '../_store';

export const dynamic = 'force-dynamic';

/* DELETE /api/agents/:id — remove one agent (vendor only) */
export async function DELETE(request, { params }) {
  if (!cookies().get('xummAccount')?.value)
    return NextResponse.json({ error:'Not auth' }, { status:401 });

  const before = store().length;
  store().splice(
    0,
    store().length,
    ...store().filter(a => a.id !== params.id)
  );

  return NextResponse.json({ removed: before - store().length });
}

import { NextResponse } from 'next/server';
import emailjs from '@emailjs/nodejs';

/*  env vars you already added in Vercel  */
const {
  EMAILJS_SERVICE_ID,        // service_pai_smtp
  EMAILJS_PUBLIC_KEY,        // qw2tG7e_AKMJ2Ml_y
  ADMIN_EMAIL = 'admin@pai-key.org',
} = process.env;

/*  your two working template IDs  */
const TEMPLATE_WELCOME = 'template_ydort24';  // template_welcome
const TEMPLATE_ADMIN   = 'template_7kj4bte';  // template_admin

export async function POST(request) {
  const { role, email } = await request.json();       // role: 'vendor' | 'free_agent'
  if (!email || !role) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const vars = {
    to_email:        email,          // for template_welcome
    new_user_email:  email,          // for template_admin
    user_type:       role            // populates subject in admin template
  };

  try {
    // 1️⃣ welcome e-mail to the user
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_WELCOME,
      vars,
      { publicKey: EMAILJS_PUBLIC_KEY }
    );

    // 2️⃣ notice to admin
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_ADMIN,
      vars,
      { publicKey: EMAILJS_PUBLIC_KEY }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('EmailJS error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

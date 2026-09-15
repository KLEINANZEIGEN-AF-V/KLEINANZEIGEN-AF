import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  const accessToken = authHeader.slice('Bearer '.length).trim();
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data: userData } = await authClient.auth.getUser();
  const user = userData.user;
  if (!user?.email) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: admin } = await adminClient
    .from('sendora_admins')
    .select('email')
    .ilike('email', user.email.trim())
    .maybeSingle();
  if (!admin) return NextResponse.json({ error: 'Accès administrateur refusé.' }, { status: 403 });

  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const allowed = ['pending', 'processing', 'completed', 'cancelled'];
  if (!body.id || !body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: 'Identifiant ou statut invalide.' }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from('sendora_transfers')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', body.id)
    .select('id,status,updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, transfer: data });
}

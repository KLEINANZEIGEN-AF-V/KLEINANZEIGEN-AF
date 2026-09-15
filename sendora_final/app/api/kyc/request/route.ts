import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getUser(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const accessToken = authHeader.slice('Bearer '.length).trim();
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data } = await authClient.auth.getUser();
  return data.user || null;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 });

  const user = await getUser(request);
  if (!user?.email) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: profile } = await adminClient.from('profiles').select('full_name,phone,email').eq('id', user.id).maybeSingle();
  const fullName = String(profile?.full_name || user.user_metadata?.full_name || '').trim();
  const phone = String(profile?.phone || user.user_metadata?.phone || '').trim();
  const email = String(profile?.email || user.email || '').trim();
  if (fullName.length < 2 || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ error: 'Complétez votre nom et votre téléphone dans votre profil avant de demander la vérification.' }, { status: 400 });
  }

  const { data: existing } = await adminClient
    .from('sendora_kyc_requests')
    .select('id,status,rejection_reason')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === 'pending' || existing?.status === 'processing' || existing?.status === 'verified') {
    return NextResponse.json({ ok: true, status: existing.status, rejection_reason: existing.rejection_reason || '' });
  }

  const { data, error } = await adminClient
    .from('sendora_kyc_requests')
    .upsert({
      user_id: user.id,
      full_name: fullName,
      email,
      phone,
      status: 'pending',
      rejection_reason: null,
      reviewed_at: null,
    }, { onConflict: 'user_id' })
    .select('id,status,rejection_reason')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: data.status, rejection_reason: data.rejection_reason || '' });
}

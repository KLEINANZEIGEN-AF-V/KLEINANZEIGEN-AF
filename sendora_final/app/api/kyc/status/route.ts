import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 });
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  const accessToken = authHeader.slice('Bearer '.length).trim();
  const authClient = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false }, global: { headers: { Authorization: `Bearer ${accessToken}` } } });
  const { data: userData } = await authClient.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await adminClient.from('sendora_kyc_requests').select('status,rejection_reason,created_at,reviewed_at').eq('user_id', userData.user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: data?.status || 'not_started', rejection_reason: data?.rejection_reason || '', request: data || null });
}

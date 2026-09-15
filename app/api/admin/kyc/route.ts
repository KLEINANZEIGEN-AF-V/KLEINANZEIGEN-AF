import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getAdmin(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) throw new Error('Configuration serveur manquante.');
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const accessToken = authHeader.slice('Bearer '.length).trim();
  const authClient = createClient(supabaseUrl, anonKey, { auth: { autoRefreshToken: false, persistSession: false }, global: { headers: { Authorization: `Bearer ${accessToken}` } } });
  const { data: userData } = await authClient.auth.getUser();
  if (!userData.user?.email) return null;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: admin } = await adminClient.from('sendora_admins').select('email').ilike('email', userData.user.email.trim()).maybeSingle();
  return admin ? { client: adminClient } : null;
}

export async function GET(request: Request) {
  try {
    const result = await getAdmin(request);
    if (!result) return NextResponse.json({ error: 'Accès administrateur refusé.' }, { status: 403 });
    const { data, error } = await result.client.from('sendora_kyc_requests').select('id,user_id,full_name,email,phone,status,rejection_reason,created_at,reviewed_at').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ requests: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await getAdmin(request);
    if (!result) return NextResponse.json({ error: 'Accès administrateur refusé.' }, { status: 403 });
    let body: { id?: string; status?: string; rejection_reason?: string };
    try { body = await request.json(); } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }); }
    const allowed = ['processing', 'verified', 'rejected'];
    if (!body.id || !body.status || !allowed.includes(body.status)) return NextResponse.json({ error: 'Identifiant ou statut invalide.' }, { status: 400 });
    const rejectionReason = body.status === 'rejected' ? String(body.rejection_reason || '').trim().slice(0, 500) : null;
    const { data, error } = await result.client.from('sendora_kyc_requests').update({ status: body.status, rejection_reason: rejectionReason, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', body.id).select('id,status,rejection_reason,reviewed_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, request: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur.' }, { status: 500 });
  }
}

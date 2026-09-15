import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 });

  const authHeader = request.headers.get('authorization');
  let user = null;
  if (authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice('Bearer '.length).trim();
    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const result = await authClient.auth.getUser();
    user = result.data.user;
  } else {
    const cookieStore = await cookies();
    const authClient = createServerClient(supabaseUrl, anonKey, {
      cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} },
    });
    const result = await authClient.auth.getUser();
    user = result.data.user;
  }
  if (!user?.email) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: admin } = await adminClient.from('sendora_admins').select('id').ilike('email', user.email.trim()).maybeSingle();
  if (!admin) return NextResponse.json({ error: 'Accès administrateur refusé.' }, { status: 403 });

  const { data, error } = await adminClient
    .from('sendora_transfers')
    .select('id,kkiapay_transaction_id,sender_name,sender_phone,sender_email,send_country,receive_country,amount_eur,fee_eur,exchange_rate,received_xof,beneficiary_name,beneficiary_phone,delivery_method,payment_amount_xof,status,kkiapay_status,created_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ transfers: data || [] });
}

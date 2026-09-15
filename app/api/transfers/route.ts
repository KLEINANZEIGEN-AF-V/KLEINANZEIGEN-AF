import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email) {
      return NextResponse.json({ error: 'Vous devez être connecté pour voir vos transferts.' }, { status: 401 });
    }

    const admin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll() { return []; }, setAll() {} } }
    );

    const { data, error } = await admin
      .from('sendora_transfers')
      .select('id,kkiapay_transaction_id,amount_eur,fee_eur,received_xof,beneficiary_name,beneficiary_phone,delivery_method,status,created_at')
      .eq('sender_email', user.email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ transfers: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Impossible de charger les transferts.' }, { status: 500 });
  }
}

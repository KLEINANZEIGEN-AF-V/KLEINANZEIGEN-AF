import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { kkiapay } from '@kkiapay-org/nodejs-sdk';

export const runtime = 'nodejs';

type ConfirmBody = {
  transactionId?: string;
  amountEUR?: number;
  feeEUR?: number;
  receivedXOF?: number;
  amountXOF?: number;
  exchangeRate?: number;
  sendCountry?: string;
  receiveCountry?: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  deliveryMethod?: string;
};

function required(name: string, value: unknown) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} est obligatoire.`);
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ConfirmBody;
    const transactionId = required('transactionId', body.transactionId);
    const beneficiaryName = required('beneficiaryName', body.beneficiaryName);
    const beneficiaryPhone = required('beneficiaryPhone', body.beneficiaryPhone);
    const sendCountry = required('sendCountry', body.sendCountry);
    const receiveCountry = required('receiveCountry', body.receiveCountry);
    const deliveryMethod = required('deliveryMethod', body.deliveryMethod);
    const exchangeRate = Number(body.exchangeRate ?? 0);
    if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) throw new Error('exchangeRate est invalide.');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY;
    const privateKey = process.env.KKIAPAY_PRIVATE_KEY;
    const secretKey = process.env.KKIAPAY_SECRET_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json({ ok: false, error: 'Supabase serveur n’est pas configuré dans Vercel.' }, { status: 500 });
    }
    if (!publicKey || !privateKey || !secretKey) {
      return NextResponse.json({ ok: false, error: 'Les clés serveur KKiaPay ne sont pas configurées dans Vercel.' }, { status: 500 });
    }

    // Le transfert doit être lancé par un utilisateur authentifié.
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ ok: false, error: 'Connexion requise.' }, { status: 401 });
    }
    const accessToken = authHeader.slice('Bearer '.length).trim();
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ ok: false, error: 'Session utilisateur invalide ou expirée.' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone, email')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json({ ok: false, error: 'Impossible de charger le profil de l’expéditeur.' }, { status: 500 });
    }

    const senderName = String(profile?.full_name || userData.user.user_metadata?.full_name || '').trim();
    const senderPhone = String(profile?.phone || userData.user.user_metadata?.phone || '').trim();
    const senderEmail = String(profile?.email || userData.user.email || '').trim();
    if (senderName.length < 2 || senderPhone.replace(/\D/g, '').length < 8 || !senderEmail.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Profil expéditeur incomplet. Veuillez compléter votre profil.' }, { status: 400 });
    }

    const kk = kkiapay({
      privatekey: privateKey,
      publickey: publicKey,
      secretkey: secretKey,
      sandbox: process.env.KKIAPAY_SANDBOX !== 'false',
    });

    const verification = await kk.verify(transactionId);
    const verified = verification as Record<string, unknown>;
    const status = String(verified.status || '').toUpperCase();
    if (status !== 'SUCCESS') {
      return NextResponse.json({ ok: false, error: `Transaction KKiaPay non confirmée. Statut: ${status || 'INCONNU'}.`, status }, { status: 400 });
    }

    const verifiedAmount = Number(verified.amount ?? body.amountXOF ?? 0);
    const requestedAmount = Number(body.amountXOF ?? 0);
    if (verifiedAmount > 0 && requestedAmount > 0 && verifiedAmount !== requestedAmount) {
      return NextResponse.json({ ok: false, error: 'Le montant vérifié par KKiaPay ne correspond pas au montant du transfert.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sendora_transfers')
      .upsert({
        kkiapay_transaction_id: transactionId,
        status: 'pending',
        kkiapay_status: status,
        amount_xof: verifiedAmount || requestedAmount,
        payment_amount_xof: verifiedAmount || requestedAmount,
        exchange_rate: exchangeRate,
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_email: senderEmail,
        amount_eur: Number(body.amountEUR ?? 0),
        fee_eur: Number(body.feeEUR ?? 0),
        received_xof: Math.round(Number(body.receivedXOF ?? 0)),
        send_country: sendCountry,
        receive_country: receiveCountry,
        beneficiary_name: beneficiaryName,
        beneficiary_phone: beneficiaryPhone,
        delivery_method: deliveryMethod,
        payer_email: senderEmail,
        kkiapay_response: verification,
      }, { onConflict: 'kkiapay_transaction_id' })
      .select('id, kkiapay_transaction_id, status, amount_xof, received_xof, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ ok: false, error: 'Le paiement est vérifié, mais l’enregistrement Supabase a échoué.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, transfer: data });
  } catch (error) {
    console.error('KKiaPay confirmation error:', error);
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erreur serveur.' }, { status: 500 });
  }
}

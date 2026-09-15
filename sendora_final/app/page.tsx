'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Script from 'next/script';
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  Zap,
  Send,
  Wallet,
  Receipt,
  UserCircle,
  Settings,
  Plus,
  Download,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Users,
  Trash2,
} from 'lucide-react';

declare global {
  interface Window {
    openKkiapayWidget?: (options: {
      amount: number;
      key: string;
      position?: 'left' | 'right' | 'center';
      sandbox?: boolean;
      data?: string;
      phone?: string;
      name?: string;
      email?: string;
      theme?: string;
      paymentmethod?: 'momo' | 'card' | 'wallet' | Array<'momo' | 'card' | 'wallet'>;
      countries?: string[];
    }) => void;
    addSuccessListener?: (callback: (response: { transactionId?: string }) => void) => void;
    addFailedListener?: (callback: (error?: unknown) => void) => void;
  }
}

type Screen =
  | 'home'
  | 'signup'
  | 'login'
  | 'dashboard'
  | 'transfer'
  | 'beneficiary'
  | 'summary'
  | 'confirmation'
  | 'transfers'
  | 'admin'
  | 'profile'
  | 'settings'
  | 'beneficiaries'
  | 'kyc';

const countries = [
  '🇧🇯 Bénin',
  '🇫🇷 France',
  '🇨🇮 Côte d’Ivoire',
  '🇸🇳 Sénégal',
  '🇹🇬 Togo',
  '🇨🇲 Cameroun',
  '🇺🇸 États-Unis',
  '🇨🇦 Canada',
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Compte
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Transfert
  const [sendCountry, setSendCountry] = useState('🇫🇷 France');
  const [receiveCountry, setReceiveCountry] = useState('🇧🇯 Bénin');
  const [amount, setAmount] = useState('');

  // Bénéficiaire
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Mobile Money');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [transfers, setTransfers] = useState<Array<{ id: string; kkiapay_transaction_id: string; amount_eur: number; fee_eur: number; received_xof: number; beneficiary_name: string; beneficiary_phone: string; delivery_method: string; status: string; created_at: string }>>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTransfers, setAdminTransfers] = useState<Array<{ id: string; kkiapay_transaction_id: string; sender_name: string | null; sender_phone: string | null; sender_email: string | null; send_country: string; receive_country: string; amount_eur: number; fee_eur: number; exchange_rate: number; received_xof: number; beneficiary_name: string; beneficiary_phone: string; delivery_method: string; payment_amount_xof: number; status: string; kkiapay_status: string | null; created_at: string }>>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Array<{ id: string; name: string; phone: string; delivery_method: string }>>([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [beneficiarySaving, setBeneficiarySaving] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [kycStatus, setKycStatus] = useState<'not_started' | 'pending' | 'processing' | 'verified' | 'rejected'>('not_started');
  const [kycReason, setKycReason] = useState('');
  const [kycLoading, setKycLoading] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [adminKyc, setAdminKyc] = useState<Array<{ id: string; user_id: string; full_name: string | null; email: string | null; phone: string | null; status: 'pending' | 'processing' | 'verified' | 'rejected'; rejection_reason: string | null; created_at: string; reviewed_at: string | null }>>([]);
  const [adminKycLoading, setAdminKycLoading] = useState(false);

  // Authentification Supabase : le profil est lié au vrai compte utilisateur.
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) return { isAdmin: false };
      const response = await fetch('/api/admin/check', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.ok ? response.json() : { isAdmin: false };
    };

    const loadProfile = async (userId: string, fallback?: { full_name?: string; phone?: string; email?: string }) => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', userId)
        .maybeSingle();

      const profile = data || fallback;
      if (profile?.full_name) setFullName(profile.full_name);
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.email) setEmail(profile.email);
    };

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!user) return;
      void checkAdmin().then((result) => setIsAdmin(Boolean(result.isAdmin))).catch(() => setIsAdmin(false));
      loadProfile(user.id, {
        full_name: String(user.user_metadata?.full_name || ''),
        phone: String(user.user_metadata?.phone || ''),
        email: user.email || '',
      });
      setScreen('dashboard');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setFullName('');
        setPhone('');
        setEmail('');
        setPassword('');
        setIsAdmin(false);
        setScreen('home');
      } else if (session?.user) {
        void checkAdmin().then((result) => setIsAdmin(Boolean(result.isAdmin))).catch(() => setIsAdmin(false));
        loadProfile(session.user.id, {
          full_name: String(session.user.user_metadata?.full_name || ''),
          phone: String(session.user.user_metadata?.phone || ''),
          email: session.user.email || '',
        });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const getSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase Auth n’est pas configuré dans Vercel.');
    }
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  };

  const saveProfile = async (userId: string, values: { fullName: string; phone: string; email: string }) => {
    const supabase = getSupabase();
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: values.fullName,
      phone: values.phone,
      email: values.email,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Impossible d’enregistrer le profil : ${error.message}`);
  };

  const senderProfileComplete =
    fullName.trim().length >= 2 &&
    phone.replace(/\D/g, '').length >= 8 &&
    email.trim().length >= 5 &&
    email.includes('@');

  const loadTransfers = async () => {
    setTransfersLoading(true);
    try {
      const response = await fetch('/api/transfers', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de charger les transferts.');
      setTransfers(Array.isArray(data.transfers) ? data.transfers : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de charger les transferts.');
    } finally {
      setTransfersLoading(false);
    }
  };

  const openTransfers = () => {
    setScreen('transfers');
    void loadTransfers();
  };

  const openProfile = () => {
    setScreen('profile');
  };

  const openSettings = () => {
    setScreen('settings');
  };

  const loadBeneficiaries = async () => {
    try {
      setBeneficiariesLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('sendora_beneficiaries')
        .select('id, name, phone, delivery_method')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBeneficiaries(Array.isArray(data) ? data : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de charger les bénéficiaires.');
    } finally {
      setBeneficiariesLoading(false);
    }
  };

  const openBeneficiaries = () => {
    setScreen('beneficiaries');
    void loadBeneficiaries();
  };

  const selectSavedBeneficiary = (item: { id: string; name: string; phone: string; delivery_method: string }) => {
    setSelectedBeneficiaryId(item.id);
    setBeneficiaryName(item.name);
    setBeneficiaryPhone(item.phone.replace(/^\+229\s*/, ''));
    setDeliveryMethod(item.delivery_method);
  };

  const saveCurrentBeneficiary = async () => {
    try {
      const name = beneficiaryName.trim();
      const cleanPhone = beneficiaryPhone.trim();
      if (name.length < 2) throw new Error('Veuillez saisir le nom du bénéficiaire.');
      if (cleanPhone.replace(/\D/g, '').length < 8) throw new Error('Veuillez saisir un numéro valide.');
      setBeneficiarySaving(true);
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error('Connexion requise.');
      const { error } = await supabase.from('sendora_beneficiaries').insert({
        user_id: user.id,
        name,
        phone: cleanPhone,
        delivery_method: deliveryMethod,
      });
      if (error) throw error;
      alert('Bénéficiaire enregistré avec succès.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible d’enregistrer le bénéficiaire.');
    } finally {
      setBeneficiarySaving(false);
    }
  };

  const deleteBeneficiary = async (id: string) => {
    if (!confirm('Supprimer ce bénéficiaire ?')) return;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('sendora_beneficiaries').delete().eq('id', id);
      if (error) throw error;
      setBeneficiaries((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de supprimer le bénéficiaire.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error('Connexion requise.');

      const cleanName = fullName.trim();
      const cleanPhone = phone.trim();
      if (cleanName.length < 2) throw new Error('Veuillez saisir votre nom complet.');
      if (cleanPhone.replace(/\D/g, '').length < 8) throw new Error('Veuillez saisir un numéro de téléphone valide.');

      setProfileSaving(true);
      await saveProfile(user.id, {
        fullName: cleanName,
        phone: cleanPhone,
        email: user.email || email,
      });
      setFullName(cleanName);
      setPhone(cleanPhone);
      alert('Profil enregistré avec succès.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible d’enregistrer le profil.');
    } finally {
      setProfileSaving(false);
    }
  };


  const handleChangePassword = async () => {
    try {
      const cleanPassword = newPassword;
      if (cleanPassword.length < 8) throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      if (cleanPassword !== confirmPassword) throw new Error('Les deux mots de passe ne correspondent pas.');

      setPasswordSaving(true);
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password: cleanPassword });
      if (error) throw new Error(`Impossible de modifier le mot de passe : ${error.message}`);

      setNewPassword('');
      setConfirmPassword('');
      alert('Mot de passe modifié avec succès.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de modifier le mot de passe.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const loadKycStatus = async () => {
    setKycLoading(true);
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Connexion requise.');
      const response = await fetch('/api/kyc/status', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de charger la vérification.');
      setKycStatus(data.status || 'not_started');
      setKycReason(data.rejection_reason || '');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de charger la vérification.');
    } finally {
      setKycLoading(false);
    }
  };

  const submitKycRequest = async () => {
    try {
      setKycSubmitting(true);
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Connexion requise.');
      const response = await fetch('/api/kyc/request', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible d’envoyer la demande.');
      setKycStatus(data.status || 'pending');
      setKycReason(data.rejection_reason || '');
      alert('Demande envoyée. L’administration Sendora va vérifier votre dossier.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible d’envoyer la demande.');
    } finally {
      setKycSubmitting(false);
    }
  };

  const loadAdminKyc = async () => {
    setAdminKycLoading(true);
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Connexion requise.');
      const response = await fetch('/api/admin/kyc', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Accès administrateur refusé.');
      setAdminKyc(Array.isArray(data.requests) ? data.requests : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de charger les vérifications KYC.');
    } finally {
      setAdminKycLoading(false);
    }
  };

  const updateAdminKycStatus = async (id: string, status: 'processing' | 'verified' | 'rejected') => {
    try {
      const reason = status === 'rejected' ? window.prompt('Motif du refus (facultatif) :') || '' : '';
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Connexion requise.');
      const response = await fetch('/api/admin/kyc', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id, status, rejection_reason: reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de modifier la vérification.');
      setAdminKyc((current) => current.map((item) => item.id === id ? { ...item, status, rejection_reason: reason || null, reviewed_at: data.request?.reviewed_at || new Date().toISOString() } : item));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de modifier la vérification.');
    }
  };

  const loadAdminTransfers = async () => {
    setAdminLoading(true);
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Connexion requise.');
      const response = await fetch('/api/admin/transfers', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Accès administrateur refusé.');
      setAdminTransfers(Array.isArray(data.transfers) ? data.transfers : []);
      void loadAdminKyc();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de charger l’administration.');
    } finally {
      setAdminLoading(false);
    }
  };

  const updateAdminTransferStatus = async (transferId: string, status: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Connexion requise.');
      const response = await fetch('/api/admin/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id: transferId, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Impossible de modifier le statut.');
      setAdminTransfers((current) => current.map((item) => item.id === transferId ? { ...item, status } : item));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible de modifier le statut.');
    }
  };

  const openAdmin = async () => {
    try {
      const supabase = getSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error('Connexion requise.');
      const response = await fetch('/api/admin/check', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = await response.json();
      if (!response.ok || !result.isAdmin) {
        setIsAdmin(false);
        alert('Accès administrateur refusé. Vérifiez que votre e-mail Sendora est bien enregistré dans sendora_admins.');
        return;
      }
      setIsAdmin(true);
      setScreen('admin');
      void loadAdminTransfers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Impossible d’ouvrir l’administration.');
    }
  };

  const openTransfer = () => {
    if (!senderProfileComplete) {
      alert('Complétez d’abord vos informations personnelles (nom, téléphone et e-mail) pour pouvoir envoyer de l’argent.');
      setScreen('signup');
      return;
    }
    setScreen('transfer');
  };

  const amountNumber = Number(amount.replace(',', '.')) || 0;

  // Valeurs de démonstration pour l'interface.
  // À remplacer par un vrai service de change/frais avant tout transfert réel.
  const rate = 655;
  const fee = amountNumber > 0 ? 1.99 : 0;
  const received = Math.max(0, amountNumber - fee) * rate;

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatEuro = (value: number) =>
    new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const kkiapayKey = process.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY || '';
  const paymentAmountXof = Math.round(amountNumber * rate);

  const startKkiapayPayment = () => {
    if (!kkiapayKey) {
      alert('La clé publique KKiaPay n’est pas configurée dans Vercel.');
      return;
    }

    if (!paymentAmountXof || paymentAmountXof < 1) {
      alert('Veuillez saisir un montant valide avant de payer.');
      return;
    }

    if (!window.openKkiapayWidget) {
      alert('KKiaPay est encore en cours de chargement. Réessayez dans quelques secondes.');
      return;
    }

    setPaymentStatus('processing');

    window.openKkiapayWidget({
      amount: paymentAmountXof,
      key: kkiapayKey,
      position: 'center',
      sandbox: true,
      name: fullName || beneficiaryName,
      email: email || undefined,
      phone: phone ? `229${phone.replace(/\D/g, '').slice(-8)}` : undefined,
      paymentmethod: ['momo', 'card'],
      countries: ['BJ', 'CI', 'TG', 'SN', 'NE'],
      theme: '#0b7598',
      data: JSON.stringify({
        beneficiaryName,
        beneficiaryPhone,
        sendCountry,
        receiveCountry,
        amountEUR: amountNumber,
        feeEUR: fee,
      }),
    });
  };

  const resetTransfer = () => {
    setAmount('');
    setBeneficiaryName('');
    setBeneficiaryPhone('');
    setDeliveryMethod('Mobile Money');
  };

  // Écran d'inscription
  if (screen === 'signup') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button
              onClick={() => setScreen('home')}
              aria-label="Retour"
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]"
            >
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#082f49]">
                Créer un compte
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Bienvenue sur Sendora
              </div>
            </div>
          </div>

          <div className="px-6 pb-8">
            <div className="rounded-2xl bg-[#eaf8fa] p-4 text-sm text-[#0b5575] mb-6">
              Créez votre compte pour envoyer de l’argent à vos proches partout
              dans le monde.
            </div>

            <label className="block text-sm font-semibold text-[#082f49]">
              Nom complet
            </label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <UserRound size={19} className="text-slate-400" />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="ml-3 w-full outline-none text-[#082f49]"
                placeholder="Votre nom complet"
              />
            </div>

            <label className="block text-sm font-semibold text-[#082f49] mt-4">
              Téléphone
            </label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <Phone size={19} className="text-slate-400" />
              <span className="ml-3 text-sm text-slate-500">+229</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="ml-2 w-full outline-none text-[#082f49]"
                inputMode="tel"
                placeholder="00 00 00 00"
              />
            </div>

            <label className="block text-sm font-semibold text-[#082f49] mt-4">
              Adresse e-mail
            </label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <Mail size={19} className="text-slate-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ml-3 w-full outline-none text-[#082f49]"
                type="email"
                placeholder="vous@exemple.com"
              />
            </div>

            <label className="block text-sm font-semibold text-[#082f49] mt-4">
              Mot de passe
            </label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <LockKeyhole size={19} className="text-slate-400" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ml-3 w-full outline-none text-[#082f49]"
                type="password"
                placeholder="Au moins 8 caractères"
              />
            </div>

            <button
              onClick={async () => {
                if (fullName.trim().length < 2 || phone.replace(/\D/g, '').length < 8 || email.trim().length < 5 || !email.includes('@')) {
                  alert('Veuillez renseigner votre nom, téléphone et e-mail.');
                  return;
                }
                if (password.length < 8) {
                  alert('Le mot de passe doit contenir au moins 8 caractères.');
                  return;
                }
                try {
                  const supabase = getSupabase();
                  const cleanName = fullName.trim();
                  const cleanPhone = phone.trim();
                  const cleanEmail = email.trim().toLowerCase();
                  const { data, error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password,
                    options: { data: { full_name: cleanName, phone: cleanPhone } },
                  });
                  if (error) throw error;
                  if (!data.user) throw new Error('Le compte n’a pas pu être créé.');
                  if (data.session) {
                    await saveProfile(data.user.id, { fullName: cleanName, phone: cleanPhone, email: cleanEmail });
                    setFullName(cleanName);
                    setPhone(cleanPhone);
                    setEmail(cleanEmail);
                    setPassword('');
                    setScreen('dashboard');
                  } else {
                    alert('Compte créé. Vérifiez votre e-mail pour confirmer votre compte, puis connectez-vous.');
                    setPassword('');
                    setScreen('login');
                  }
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'Impossible de créer le compte.');
                }
              }}
              className="mt-6 w-full rounded-full bg-[#0b7598] py-4 text-lg font-bold text-white shadow-lg shadow-cyan-900/15"
            >
              Continuer <ArrowRight className="inline ml-2" size={21} />
            </button>
            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              En continuant, vous acceptez les conditions d’utilisation et la
              politique de confidentialité de Sendora.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // Connexion
  if (screen === 'login') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button
              onClick={() => setScreen('home')}
              aria-label="Retour"
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]"
            >
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#082f49]">Se connecter</div>
              <div className="text-xs text-slate-400 mt-1">Accédez à votre espace Sendora</div>
            </div>
          </div>
          <div className="px-6 pb-8">
            <label className="block text-sm font-semibold text-[#082f49]">Adresse e-mail</label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <Mail size={19} className="text-slate-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="ml-3 w-full outline-none text-[#082f49]" type="email" placeholder="vous@exemple.com" />
            </div>
            <label className="block text-sm font-semibold text-[#082f49] mt-4">Mot de passe</label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <LockKeyhole size={19} className="text-slate-400" />
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="ml-3 w-full outline-none text-[#082f49]" type="password" placeholder="Votre mot de passe" />
            </div>
            <button
              onClick={async () => {
                if (!email.trim() || !password) { alert('Entrez votre e-mail et votre mot de passe.'); return; }
                try {
                  const supabase = getSupabase();
                  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
                  if (error) throw error;
                  if (!data.user) throw new Error('Connexion impossible.');
                  const { data: profile } = await supabase.from('profiles').select('full_name, phone, email').eq('id', data.user.id).maybeSingle();
                  const name = profile?.full_name || String(data.user.user_metadata?.full_name || '');
                  const userPhone = profile?.phone || String(data.user.user_metadata?.phone || '');
                  setFullName(name);
                  setPhone(userPhone);
                  setEmail(profile?.email || data.user.email || '');
                  setPassword('');
                  setScreen('dashboard');
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'Connexion impossible.');
                }
              }}
              className="mt-6 w-full rounded-full bg-[#0b7598] py-4 text-lg font-bold text-white shadow-lg shadow-cyan-900/15"
            >
              Se connecter <ArrowRight className="inline ml-2" size={21} />
            </button>
            <button onClick={() => setScreen('signup')} className="mt-3 w-full rounded-full border-2 border-[#cfe1e8] bg-white py-4 text-base font-bold text-[#0b5575]">Créer un nouveau compte</button>
          </div>
        </section>
      </main>
    );
  }

  // Choix du transfert
  if (screen === 'transfer') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button
              onClick={() => setScreen('dashboard')}
              aria-label="Retour"
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]"
            >
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#082f49]">
                Envoyer de l'argent
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Nouveau transfert international
              </div>
            </div>
          </div>

          <div className="px-6 pb-8">
            <div className="rounded-2xl bg-[#eaf8fa] p-4 text-sm text-[#0b5575] mb-6">
              Choisissez le pays depuis lequel vous envoyez de l'argent et le
              pays où le bénéficiaire recevra les fonds.
            </div>

            <label className="block text-sm font-semibold text-[#082f49]">
              Pays d'envoi
            </label>
            <p className="mt-1 text-xs text-slate-400">
              Sélectionnez le pays depuis lequel vous envoyez de l'argent
            </p>
            <div className="mt-2 rounded-2xl border border-slate-200 px-4 py-3.5">
              <select
                value={sendCountry}
                onChange={(e) => setSendCountry(e.target.value)}
                className="w-full bg-transparent outline-none text-[#082f49]"
              >
                {countries.map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </select>
            </div>

            <label className="block text-sm font-semibold text-[#082f49] mt-5">
              Pays de réception
            </label>
            <p className="mt-1 text-xs text-slate-400">
              Sélectionnez le pays où le bénéficiaire recevra l'argent
            </p>
            <div className="mt-2 rounded-2xl border border-slate-200 px-4 py-3.5">
              <select
                value={receiveCountry}
                onChange={(e) => setReceiveCountry(e.target.value)}
                className="w-full bg-transparent outline-none text-[#082f49]"
              >
                {countries.map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </select>
            </div>

            <label className="block text-sm font-semibold text-[#082f49] mt-5">
              Montant à envoyer
            </label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <input
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.,]/g, ''))
                }
                className="w-full outline-none text-2xl font-bold text-[#082f49]"
                inputMode="decimal"
                placeholder="0,00"
              />
              <span className="font-semibold text-slate-500">EUR</span>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Frais Sendora</span>
                <span className="font-semibold text-[#082f49]">
                  {amountNumber > 0 ? `${formatEuro(fee)} EUR` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Taux de change</span>
                <span className="font-semibold text-[#082f49]">
                  {amountNumber > 0 ? `1 EUR = ${rate} FCFA` : '—'}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="font-semibold text-[#082f49]">
                  Le bénéficiaire reçoit
                </span>
                <span className="font-bold text-[#0b7598]">
                  {amountNumber > 0
                    ? `${formatMoney(received)} FCFA`
                    : '— FCFA'}
                </span>
              </div>
            </div>

            <button
              disabled={amountNumber <= 0}
              onClick={() => { setScreen('beneficiary'); void loadBeneficiaries(); }}
              className={`mt-6 w-full rounded-full py-4 text-lg font-bold shadow-lg ${
                amountNumber > 0
                  ? 'bg-[#0b7598] text-white shadow-cyan-900/15'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continuer <ArrowRight className="inline ml-2" size={21} />
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Les frais et le taux définitifs doivent être confirmés avant un
              vrai transfert.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // Bénéficiaire
  if (screen === 'beneficiary') {
    const validBeneficiary =
      beneficiaryName.trim().length >= 2 &&
      beneficiaryPhone.replace(/\D/g, '').length >= 8;

    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button
              onClick={() => setScreen('transfer')}
              aria-label="Retour"
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]"
            >
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#082f49]">
                Bénéficiaire
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Qui doit recevoir l'argent ?
              </div>
            </div>
          </div>

          <div className="px-6 pb-8">
            <div className="rounded-2xl bg-[#eaf8fa] p-4 text-sm text-[#0b5575] mb-5">
              Entrez les coordonnées de la personne qui recevra{' '}
              <strong>{formatMoney(received)} FCFA</strong>.
            </div>

            {beneficiaries.length > 0 && (
              <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="font-bold text-[#082f49]">Choisir un bénéficiaire enregistré</div>
                <div className="mt-2 space-y-2">
                  {beneficiaries.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectSavedBeneficiary(item)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selectedBeneficiaryId === item.id
                          ? 'border-[#0b7598] bg-[#eaf8fa]'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-[#082f49]">{item.name}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.phone} · {item.delivery_method}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="block text-sm font-semibold text-[#082f49]">
              Nom complet du bénéficiaire
            </label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <UserRound size={19} className="text-slate-400" />
              <input
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className="ml-3 w-full outline-none text-[#082f49]"
                placeholder="Nom et prénom"
              />
            </div>

            <label className="block text-sm font-semibold text-[#082f49] mt-5">
              Téléphone du bénéficiaire
            </label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3.5">
              <Phone size={19} className="text-slate-400" />
              <span className="ml-3 text-sm text-slate-500">+229</span>
              <input
                value={beneficiaryPhone}
                onChange={(e) => setBeneficiaryPhone(e.target.value)}
                className="ml-2 w-full outline-none text-[#082f49]"
                inputMode="tel"
                placeholder="00 00 00 00"
              />
            </div>

            <label className="block text-sm font-semibold text-[#082f49] mt-5">
              Mode de réception
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {['Mobile Money', 'Compte bancaire'].map((method) => (
                <button
                  key={method}
                  onClick={() => setDeliveryMethod(method)}
                  className={`rounded-2xl border px-3 py-4 text-sm font-semibold ${
                    deliveryMethod === method
                      ? 'border-[#0b7598] bg-[#eaf8fa] text-[#0b7598]'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            <button
              disabled={!validBeneficiary || beneficiarySaving}
              onClick={saveCurrentBeneficiary}
              className={`mt-5 w-full rounded-full border-2 py-3.5 text-base font-bold ${
                validBeneficiary ? 'border-[#cfe1e8] text-[#0b5575] bg-white' : 'border-slate-200 text-slate-400 bg-slate-50'
              }`}
            >
              {beneficiarySaving ? 'Enregistrement…' : 'Enregistrer ce bénéficiaire'}
            </button>

            <button
              disabled={!validBeneficiary}
              onClick={() => setScreen('summary')}
              className={`mt-7 w-full rounded-full py-4 text-lg font-bold shadow-lg ${
                validBeneficiary
                  ? 'bg-[#0b7598] text-white shadow-cyan-900/15'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Voir le récapitulatif{' '}
              <ArrowRight className="inline ml-2" size={21} />
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Récapitulatif
  if (screen === 'summary') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button
              onClick={() => setScreen('beneficiary')}
              aria-label="Retour"
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]"
            >
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#082f49]">
                Récapitulatif
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Vérifiez votre transfert
              </div>
            </div>
          </div>

          <div className="px-6 pb-8">
            <div className="rounded-[26px] bg-gradient-to-br from-[#073b5c] via-[#0f9fb5] to-[#63c9ca] p-5 text-white">
              <div className="text-sm text-white/75">Montant envoyé</div>
              <div className="mt-1 text-3xl font-extrabold">
                {formatEuro(amountNumber)} EUR
              </div>
              <div className="mt-1 text-sm text-white/80">
                {sendCountry} → {receiveCountry}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 p-4 space-y-4">
              <div>
                <div className="text-xs text-slate-400">Bénéficiaire</div>
                <div className="mt-1 font-bold text-[#082f49]">
                  {beneficiaryName}
                </div>
                <div className="text-sm text-slate-500">
                  +229 {beneficiaryPhone}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-400">Mode de réception</div>
                <div className="mt-1 font-semibold text-[#082f49]">
                  {deliveryMethod}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Montant</span>
                  <span className="font-semibold">{formatEuro(amountNumber)} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Frais</span>
                  <span className="font-semibold">{formatEuro(fee)} EUR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Taux</span>
                  <span className="font-semibold">1 EUR = {rate} FCFA</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="font-bold text-[#082f49]">Reçu</span>
                  <span className="font-extrabold text-[#0b7598]">
                    {formatMoney(received)} FCFA
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              <ShieldCheck className="shrink-0 text-[#0b7598]" size={20} />
              <span>
                Vérifiez attentivement le numéro du bénéficiaire avant de
                confirmer.
              </span>
            </div>

            <Script
              src="https://cdn.kkiapay.me/k.js"
              strategy="afterInteractive"
              onLoad={() => {
                if (window.addSuccessListener) {
                  window.addSuccessListener(async (response) => {
                    const kkTransactionId = response?.transactionId || '';

                    if (!kkTransactionId) {
                      setPaymentStatus('failed');
                      alert('KKiaPay n’a pas fourni de référence de transaction.');
                      return;
                    }

                    setPaymentStatus('processing');
                    setTransactionId(kkTransactionId);

                    try {
                      const supabase = getSupabase();
                      const { data: sessionData } = await supabase.auth.getSession();
                      const accessToken = sessionData.session?.access_token;
                      if (!accessToken) {
                        throw new Error('Votre session Sendora a expiré. Reconnectez-vous avant de confirmer le transfert.');
                      }

                      const confirmResponse = await fetch('/api/kkiapay/confirm', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                          transactionId: kkTransactionId,
                          amountEUR: amountNumber,
                          feeEUR: fee,
                          receivedXOF: Math.round(received),
                          amountXOF: paymentAmountXof,
                          exchangeRate: rate,
                          senderName: fullName,
                          senderPhone: phone,
                          senderEmail: email,
                          sendCountry,
                          receiveCountry,
                          beneficiaryName,
                          beneficiaryPhone,
                          deliveryMethod,
                          email,
                        }),
                      });

                      const result = await confirmResponse.json();

                      if (!confirmResponse.ok || !result.ok) {
                        throw new Error(result.error || 'La vérification du paiement a échoué.');
                      }

                      setPaymentStatus('success');
                      setScreen('confirmation');
                    } catch (error) {
                      console.error('KKiaPay/Supabase confirmation error:', error);
                      setPaymentStatus('failed');
                      alert(
                        error instanceof Error
                          ? error.message
                          : 'Impossible d’enregistrer le transfert.'
                      );
                    }
                  });
                }
                if (window.addFailedListener) {
                  window.addFailedListener(() => setPaymentStatus('failed'));
                }
              }}
            />

            <button
              onClick={startKkiapayPayment}
              disabled={paymentStatus === 'processing'}
              className="mt-6 w-full rounded-full bg-[#0b7598] py-4 text-lg font-bold text-white shadow-lg shadow-cyan-900/15 disabled:opacity-60"
            >
              {paymentStatus === 'processing' ? 'Ouverture du paiement…' : 'Payer et confirmer'}
              {paymentStatus !== 'processing' && (
                <ArrowRight className="inline ml-2" size={21} />
              )}
            </button>

            {paymentStatus === 'failed' && (
              <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-600">
                Le paiement n’a pas abouti. Vous pouvez réessayer.
              </div>
            )}

            <div className="mt-3 text-center text-xs text-slate-400">
              Paiement test KKiaPay • {formatMoney(paymentAmountXof)} FCFA
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Confirmation
  if (screen === 'confirmation') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40 p-7 text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-[#eaf8fa] flex items-center justify-center text-[#0b7598]">
            <CheckCircle2 size={48} />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-[#082f49]">
            Transfert confirmé
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Votre paiement a été vérifié par KKiaPay et votre transfert est enregistré.
          </p>

          {transactionId && (
            <div className="mt-4 rounded-2xl bg-[#eaf8fa] p-3 text-xs text-[#0b7598]">
              Référence KKiaPay : <span className="font-bold">{transactionId}</span>
            </div>
          )}

          <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left">
            <div className="text-xs text-slate-400">Bénéficiaire</div>
            <div className="mt-1 font-bold text-[#082f49]">
              {beneficiaryName}
            </div>
            <div className="text-sm text-slate-500">
              +229 {beneficiaryPhone}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 flex justify-between">
              <span className="text-slate-500">Montant reçu</span>
              <span className="font-extrabold text-[#0b7598]">
                {formatMoney(received)} FCFA
              </span>
            </div>

            <div className="mt-2 flex justify-between">
              <span className="text-slate-500">Statut</span>
              <span className="font-semibold text-[#0b7598]">En attente</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#fff8e8] p-4 text-xs text-[#775b20] text-left">
            <strong>Mode test :</strong> KKiaPay et l’enregistrement Supabase sont connectés.
            Aucun argent réel n’est envoyé tant que le mode Sandbox est activé.
          </div>

          <button
            onClick={() => {
              resetTransfer();
              setScreen('dashboard');
            }}
            className="mt-6 w-full rounded-full bg-[#0b7598] py-4 text-lg font-bold text-white"
          >
            Retour à mon espace
          </button>
        </section>
      </main>
    );
  }

  // Historique complet des transferts
  if (screen === 'transfers') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} aria-label="Retour" className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]">
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#082f49]">Tous les transferts</div>
              <div className="text-xs text-slate-400 mt-1">Historique de votre compte Sendora</div>
            </div>
          </div>

          <div className="px-6 pb-8">
            {transfersLoading ? (
              <div className="rounded-2xl bg-[#eaf8fa] p-5 text-center text-[#0b5575]">Chargement de vos transferts…</div>
            ) : transfers.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 p-6 text-center">
                <Receipt className="mx-auto text-[#0b7598]" size={32} />
                <div className="mt-3 font-bold text-[#082f49]">Aucun transfert</div>
                <div className="mt-1 text-sm text-slate-400">Vos transferts confirmés apparaîtront ici.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-[#082f49]">{transfer.beneficiary_name}</div>
                        <div className="text-xs text-slate-400">{transfer.beneficiary_phone} • {transfer.delivery_method}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-[#0b7598]">{formatMoney(Number(transfer.received_xof))} FCFA</div>
                        <div className="text-xs text-slate-400">{formatEuro(Number(transfer.amount_eur))} EUR</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="text-slate-400">Réf. {transfer.kkiapay_transaction_id}</span>
                      <span className="font-semibold text-[#0b7598]">{transfer.status === 'pending' ? 'En attente' : transfer.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={loadTransfers} className="mt-5 w-full rounded-full border-2 border-[#cfe1e8] bg-white py-3.5 font-bold text-[#0b5575]">Actualiser</button>
          </div>
        </section>
      </main>
    );
  }

  // Administration
  if (screen === 'admin') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} aria-label="Retour" className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]">
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#082f49]">Administration</div>
              <div className="text-xs text-slate-400 mt-1">Gestion des transferts Sendora</div>
            </div>
          </div>
          <div className="px-6 pb-8">
            <div className="rounded-2xl bg-[#eaf8fa] p-4 text-sm text-[#0b5575]">
              <div className="font-bold">{adminTransfers.length} transfert(s)</div>
              <div className="mt-1 text-xs">Vue réservée aux administrateurs autorisés.</div>
            </div>
            {adminLoading ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-center text-slate-500">Chargement…</div>
            ) : adminTransfers.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-100 p-6 text-center text-slate-400">Aucun transfert enregistré.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {adminTransfers.map((transfer) => (
                  <div key={transfer.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-[#082f49]">{transfer.beneficiary_name}</div>
                        <div className="mt-1 text-xs text-slate-400">Expéditeur : {transfer.sender_name || '—'}</div>
                        <div className="text-xs text-slate-400">{transfer.sender_email || '—'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-[#0b7598]">{formatMoney(Number(transfer.received_xof))} FCFA</div>
                        <div className="text-xs text-slate-400">{formatEuro(Number(transfer.amount_eur))} EUR</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                      <div><span className="text-slate-400">Route</span><div className="font-semibold text-[#082f49]">{transfer.send_country} → {transfer.receive_country}</div></div>
                      <div><span className="text-slate-400">Mode</span><div className="font-semibold text-[#082f49]">{transfer.delivery_method}</div></div>
                      <div>
                        <span className="text-slate-400">Statut</span>
                        <div className="font-semibold text-[#0b7598]">{transfer.status === 'pending' ? 'En attente' : transfer.status === 'processing' ? 'En traitement' : transfer.status === 'completed' ? 'Terminé' : transfer.status === 'cancelled' ? 'Annulé' : transfer.status}</div>
                      </div>
                      <div><span className="text-slate-400">Réf.</span><div className="font-semibold text-[#082f49] truncate">{transfer.kkiapay_transaction_id}</div></div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button onClick={() => updateAdminTransferStatus(transfer.id, 'processing')} className="rounded-xl bg-[#eaf8fa] px-2 py-2 text-xs font-bold text-[#0b7598]">Traiter</button>
                      <button onClick={() => updateAdminTransferStatus(transfer.id, 'completed')} className="rounded-xl bg-[#0b7598] px-2 py-2 text-xs font-bold text-white">Terminer</button>
                      <button onClick={() => updateAdminTransferStatus(transfer.id, 'cancelled')} className="rounded-xl border border-red-200 bg-white px-2 py-2 text-xs font-bold text-red-600">Annuler</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="text-lg font-extrabold text-[#082f49]">Vérifications d’identité</div>
              <div className="mt-1 text-xs text-slate-400">Validez manuellement les demandes KYC des utilisateurs.</div>
              {adminKycLoading ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-center text-slate-500">Chargement…</div>
              ) : adminKyc.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-100 p-5 text-center text-slate-400">Aucune demande de vérification.</div>
              ) : (
                <div className="mt-4 space-y-3">
                  {adminKyc.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div><div className="font-bold text-[#082f49]">{request.full_name || 'Utilisateur'}</div><div className="mt-1 text-xs text-slate-400">{request.email || '—'}</div><div className="text-xs text-slate-400">{request.phone || '—'}</div></div>
                        <div className="text-right text-xs font-bold text-[#0b7598]">{request.status === 'pending' ? 'En attente' : request.status === 'processing' ? 'En cours' : request.status === 'verified' ? 'Vérifiée' : 'Refusée'}</div>
                      </div>
                      {request.rejection_reason ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">Motif : {request.rejection_reason}</div> : null}
                      {request.status !== 'verified' ? (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <button onClick={() => void updateAdminKycStatus(request.id, 'processing')} className="rounded-xl bg-[#eaf8fa] px-2 py-2 text-xs font-bold text-[#0b7598]">Examiner</button>
                          <button onClick={() => void updateAdminKycStatus(request.id, 'verified')} className="rounded-xl bg-[#0b7598] px-2 py-2 text-xs font-bold text-white">Valider</button>
                          <button onClick={() => void updateAdminKycStatus(request.id, 'rejected')} className="rounded-xl border border-red-200 bg-white px-2 py-2 text-xs font-bold text-red-600">Refuser</button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => void loadAdminKyc()} className="mt-4 w-full rounded-full border-2 border-[#cfe1e8] bg-white py-3.5 font-bold text-[#0b5575]">Actualiser les vérifications</button>
            </div>

            <button onClick={loadAdminTransfers} className="mt-5 w-full rounded-full border-2 border-[#cfe1e8] bg-white py-3.5 font-bold text-[#0b5575]">Actualiser</button>
          </div>
        </section>
      </main>
    );
  }

  // Bénéficiaires enregistrés
  if (screen === 'beneficiaries') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button onClick={() => setScreen('dashboard')} aria-label="Retour" className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]">
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-[#082f49]">Mes bénéficiaires</div>
              <div className="text-xs text-slate-400 mt-1">Gérez les personnes à qui vous envoyez de l’argent</div>
            </div>
          </div>

          <div className="px-6 pb-8">
            <button onClick={() => setScreen('beneficiary')} className="w-full rounded-[22px] bg-[#0b7598] py-4 text-base font-bold text-white shadow-lg shadow-cyan-900/15">
              <Plus className="inline mr-2" size={19} /> Ajouter un bénéficiaire
            </button>

            {beneficiariesLoading ? (
              <div className="mt-6 rounded-2xl border border-slate-100 p-5 text-center text-slate-400">Chargement…</div>
            ) : beneficiaries.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-100 p-6 text-center">
                <Users className="mx-auto text-[#0b7598]" size={30} />
                <div className="mt-3 font-bold text-[#082f49]">Aucun bénéficiaire enregistré</div>
                <div className="mt-1 text-sm text-slate-400">Ajoutez un bénéficiaire pour le retrouver plus rapidement lors d’un prochain transfert.</div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {beneficiaries.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-100 p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-[#082f49] truncate">{item.name}</div>
                      <div className="text-sm text-slate-400 mt-1">{item.phone} · {item.delivery_method}</div>
                    </div>
                    <button onClick={() => void deleteBeneficiary(item.id)} aria-label="Supprimer" className="h-10 w-10 shrink-0 rounded-full border border-red-100 text-red-500 flex items-center justify-center">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  // Vérification d'identité (KYC)
  if (screen === 'kyc') {
    const kycLabel = kycStatus === 'pending' ? 'En attente de vérification' : kycStatus === 'processing' ? 'Vérification en cours' : kycStatus === 'verified' ? 'Identité vérifiée' : kycStatus === 'rejected' ? 'Vérification refusée' : 'Vérification non demandée';
    const kycBox = kycStatus === 'verified' ? 'bg-emerald-50 text-emerald-800' : kycStatus === 'rejected' ? 'bg-red-50 text-red-800' : kycStatus === 'processing' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800';
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7">
            <button onClick={() => setScreen('profile')} className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#0b5575]" aria-label="Retour">
              <ArrowLeft size={21} />
            </button>
            <div className="mt-5 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#eaf8fa] text-[#0b7598] flex items-center justify-center"><ShieldCheck size={36} /></div>
              <div><h1 className="text-2xl font-extrabold text-[#082f49]">Vérifier mon identité</h1><p className="text-sm text-slate-400">Validation manuelle par Sendora</p></div>
            </div>
          </div>
          <div className="px-6 mt-7 pb-8">
            {kycLoading ? (
              <div className="rounded-2xl bg-slate-50 p-5 text-center text-slate-500">Chargement du statut…</div>
            ) : (
              <>
                <div className={`rounded-2xl p-4 ${kycBox}`}>
                  <div className="font-bold">Statut : {kycLabel}</div>
                  <div className="mt-1 text-sm">Votre demande est traitée par l’administration Sendora.</div>
                  {kycStatus === 'rejected' && kycReason ? <div className="mt-2 text-sm font-semibold">Motif : {kycReason}</div> : null}
                </div>
                <div className="mt-5 rounded-2xl bg-[#eaf8fa] p-5 text-[#0b5575]">
                  <div className="flex items-start gap-3"><ShieldCheck className="shrink-0 mt-0.5 text-[#0b7598]" size={22} /><div><div className="font-bold">Pourquoi vérifier votre identité ?</div><p className="mt-1 text-sm leading-5 text-slate-600">La vérification peut être nécessaire avant certaines opérations de transfert, conformément aux règles applicables.</p></div></div>
                </div>
                <div className="mt-5 rounded-2xl border border-slate-100 p-5">
                  <div className="font-bold text-[#082f49]">Processus Sendora</div>
                  <div className="mt-4 space-y-4 text-sm text-slate-600">
                    <div className="flex gap-3"><div className="h-7 w-7 rounded-full bg-[#0b7598] text-white flex items-center justify-center font-bold">1</div><div><b>Demande</b><div className="text-slate-400">Vous envoyez votre demande depuis votre profil.</div></div></div>
                    <div className="flex gap-3"><div className="h-7 w-7 rounded-full bg-[#0b7598] text-white flex items-center justify-center font-bold">2</div><div><b>Contrôle administratif</b><div className="text-slate-400">L’administration Sendora examine les informations nécessaires.</div></div></div>
                    <div className="flex gap-3"><div className="h-7 w-7 rounded-full bg-[#0b7598] text-white flex items-center justify-center font-bold">3</div><div><b>Décision</b><div className="text-slate-400">Le statut est mis à jour dans votre compte.</div></div></div>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800"><b>Important :</b> cette version utilise une validation manuelle interne. Elle ne constitue pas à elle seule une intégration KYC réglementaire complète pour les transferts d’argent en production.</div>
                {kycStatus !== 'verified' && kycStatus !== 'processing' ? (
                  <button disabled={kycSubmitting} onClick={() => void submitKycRequest()} className="mt-5 w-full rounded-[22px] bg-[#0b7598] py-4 text-base font-bold text-white shadow-lg shadow-cyan-900/15 disabled:opacity-60">
                    {kycSubmitting ? 'Envoi…' : kycStatus === 'rejected' ? 'Soumettre à nouveau' : 'Demander la vérification'}
                    <ArrowRight className="inline ml-2" size={20} />
                  </button>
                ) : null}
                <button onClick={() => void loadKycStatus()} className="mt-3 w-full rounded-full border-2 border-[#cfe1e8] bg-white py-3.5 font-bold text-[#0b5575]">Actualiser le statut</button>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  // Profil utilisateur
  if (screen === 'profile') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7">
            <button
              onClick={() => setScreen('dashboard')}
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#0b5575]"
              aria-label="Retour"
            >
              <ArrowLeft size={21} />
            </button>
            <div className="mt-5 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#0f9fb5] text-white flex items-center justify-center">
                <UserCircle size={36} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#082f49]">Mon profil</h1>
                <p className="text-sm text-slate-400">Gérez vos informations personnelles</p>
              </div>
            </div>
          </div>

          <div className="px-6 mt-7 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#082f49]">Nom complet</label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 outline-none focus:border-[#0f9fb5]"
                  placeholder="Votre nom complet"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#082f49]">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 outline-none focus:border-[#0f9fb5]"
                  placeholder="Votre numéro"
                  inputMode="tel"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#082f49]">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
                <input
                  value={email}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-slate-500 outline-none"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">L’adresse e-mail de connexion ne peut pas être modifiée ici.</p>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="w-full rounded-[22px] bg-[#0b7598] py-4 text-base font-bold text-white shadow-lg shadow-cyan-900/15 disabled:opacity-60"
            >
              {profileSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>

            <button
              onClick={openBeneficiaries}
              className="mt-4 w-full rounded-[22px] border-2 border-[#cfe1e8] bg-white py-4 text-base font-bold text-[#0b5575]"
            >
              <Users className="inline mr-2" size={19} /> Mes bénéficiaires
            </button>

            <button
              onClick={() => { setScreen('kyc'); void loadKycStatus(); }}
              className="mt-4 w-full rounded-[22px] border-2 border-[#cfe1e8] bg-white py-4 text-base font-bold text-[#0b5575]"
            >
              <ShieldCheck className="inline mr-2" size={19} /> Vérifier mon identité
            </button>
          </div>

          <div className="mt-7 border-t border-slate-100 px-6 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#eaf8fa] text-[#0b7598] flex items-center justify-center">
                <LockKeyhole size={20} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#082f49]">Sécurité du compte</h2>
                <p className="text-xs text-slate-400">Modifiez votre mot de passe</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 outline-none focus:border-[#0f9fb5]"
                placeholder="Nouveau mot de passe"
                autoComplete="new-password"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 px-4 outline-none focus:border-[#0f9fb5]"
                placeholder="Confirmer le mot de passe"
                autoComplete="new-password"
              />
              <p className="text-xs text-slate-400">8 caractères minimum.</p>
              <button
                onClick={handleChangePassword}
                disabled={passwordSaving || !newPassword || !confirmPassword}
                className="w-full rounded-[20px] border-2 border-[#cfe1e8] bg-white py-3.5 font-bold text-[#0b5575] disabled:opacity-50"
              >
                {passwordSaving ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 px-6 py-5">
            <button
              onClick={async () => {
                try { await getSupabase().auth.signOut(); } catch (error) { alert(error instanceof Error ? error.message : 'Déconnexion impossible.'); }
              }}
              className="w-full rounded-2xl border-2 border-red-100 bg-white py-3.5 font-bold text-red-600"
            >
              Déconnexion
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Tableau de bord
  if (screen === 'dashboard') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Bonjour 👋</div>
              <div className="text-2xl font-extrabold text-[#082f49]">
                Votre espace Sendora
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-[#0b7598]">
                <Bell size={20} />
              </button>
              <button
                onClick={async () => {
                  try { await getSupabase().auth.signOut(); } catch (error) { alert(error instanceof Error ? error.message : 'Déconnexion impossible.'); }
                }}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <div className="mx-6 mt-6 rounded-[28px] bg-gradient-to-br from-[#073b5c] via-[#0f9fb5] to-[#63c9ca] p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/70">Solde disponible</div>
                <div className="mt-2 text-3xl font-extrabold">0,00 €</div>
              </div>
              <Wallet size={28} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="rounded-2xl bg-white/15 py-3 text-sm font-semibold">
                <Plus className="inline mr-1" size={17} /> Ajouter
              </button>
              <button className="rounded-2xl bg-white text-[#07506d] py-3 text-sm font-semibold">
                <Download className="inline mr-1" size={17} /> Recevoir
              </button>
            </div>
          </div>

          <div className="px-6 mt-6">
            <button
              onClick={openTransfer}
              className="w-full rounded-[24px] bg-[#0b7598] py-4 text-lg font-bold text-white shadow-lg shadow-cyan-900/15"
            >
              <Send className="inline mr-2" size={21} /> Envoyer de l'argent
            </button>
          </div>

          <div className="px-6 mt-4">
            <button onClick={openAdmin} className="w-full rounded-[20px] border-2 border-[#cfe1e8] bg-white py-3.5 text-sm font-bold text-[#0b5575]">
              <ShieldCheck className="inline mr-2" size={18} /> Administration
            </button>
          </div>

          <div className="px-6 mt-4">
            <button onClick={openBeneficiaries} className="w-full rounded-[20px] border-2 border-[#cfe1e8] bg-white py-3.5 text-sm font-bold text-[#0b5575]">
              <Users className="inline mr-2" size={18} /> Mes bénéficiaires
            </button>
          </div>

          <div className="px-6 mt-7">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#082f49]">
                Derniers transferts
              </h2>
              <button onClick={openTransfers} className="text-sm font-semibold text-[#0b7598]">
                Voir tout
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-[#0b7598]">
                  <Receipt size={20} />
                </div>
                <div>
                  <div className="font-semibold text-[#082f49]">
                    Aucun transfert
                  </div>
                  <div className="text-xs text-slate-400">
                    Vos opérations apparaîtront ici
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 px-5 py-4 grid grid-cols-3 text-center">
            <button
              onClick={openTransfer}
              className="text-[#0b7598]"
            >
              <Send className="mx-auto" size={20} />
              <div className="mt-1 text-xs font-semibold">Transférer</div>
            </button>
            <button onClick={openProfile} className="text-slate-400">
              <UserCircle className="mx-auto" size={20} />
              <div className="mt-1 text-xs font-semibold">Profil</div>
            </button>
            <button onClick={openSettings} className="text-[#0b7598]">
              <Settings className="mx-auto" size={20} />
              <div className="mt-1 text-xs font-semibold">Paramètres</div>
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'settings') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
          <div className="px-6 pt-7 pb-5 flex items-center gap-4">
            <button onClick={() => setScreen('dashboard')} className="h-12 w-12 rounded-full border border-slate-200 flex items-center justify-center text-[#0b7598]">
              <ArrowLeft size={23} />
            </button>
            <div>
              <div className="text-2xl font-extrabold text-[#082f49]">Paramètres</div>
              <div className="text-sm text-slate-400">Personnalisez votre espace Sendora</div>
            </div>
          </div>

          <div className="px-6 pb-7 space-y-3">
            <button className="w-full rounded-2xl border border-slate-100 p-4 text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-cyan-50 flex items-center justify-center text-[#0b7598]"><Bell size={21} /></div>
                <div><div className="font-bold text-[#082f49]">Notifications</div><div className="text-xs text-slate-400">Recevoir les mises à jour de vos transferts</div></div>
              </div>
              <span className="text-xs font-bold text-[#0b7598]">Activées</span>
            </button>

            <button
              type="button"
              onClick={() => setShowLanguagePicker(true)}
              className="w-full rounded-2xl border border-slate-100 p-4 flex items-center justify-between text-left active:bg-slate-50"
            >
              <div>
                <div className="font-bold text-[#082f49]">Langue</div>
                <div className="text-xs text-slate-400">Langue de l'application</div>
              </div>
              <span className="font-bold text-[#0b7598]">{language === 'fr' ? 'Français' : 'English'}</span>
            </button>

            {showLanguagePicker && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4" onClick={() => setShowLanguagePicker(false)}>
                <div
                  className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-extrabold text-[#082f49]">Choisir la langue</div>
                      <div className="text-xs text-slate-400 mt-1">Sélectionnez la langue de votre espace Sendora</div>
                    </div>
                    <button type="button" onClick={() => setShowLanguagePicker(false)} className="h-10 w-10 rounded-full bg-slate-100 text-slate-500">×</button>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setLanguage('fr'); setShowLanguagePicker(false); }}
                    className={`w-full rounded-2xl border p-4 text-left mb-3 ${language === 'fr' ? 'border-[#0b7598] bg-cyan-50' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div><div className="font-bold text-[#082f49]">🇫🇷 Français</div><div className="text-xs text-slate-400 mt-1">Langue actuelle</div></div>
                      {language === 'fr' && <span className="font-bold text-[#0b7598]">✓</span>}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setLanguage('en'); setShowLanguagePicker(false); }}
                    className={`w-full rounded-2xl border p-4 text-left ${language === 'en' ? 'border-[#0b7598] bg-cyan-50' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div><div className="font-bold text-[#082f49]">🇬🇧 English</div><div className="text-xs text-slate-400 mt-1">English</div></div>
                      {language === 'en' && <span className="font-bold text-[#0b7598]">✓</span>}
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
              <div><div className="font-bold text-[#082f49]">Devise</div><div className="text-xs text-slate-400">Devise principale</div></div>
              <span className="font-bold text-[#0b7598]">EUR / FCFA</span>
            </div>

            <button onClick={openProfile} className="w-full rounded-2xl border border-slate-100 p-4 text-left flex items-center justify-between">
              <div><div className="font-bold text-[#082f49]">Sécurité du compte</div><div className="text-xs text-slate-400">Profil et mot de passe</div></div>
              <ArrowRight size={20} className="text-[#0b7598]" />
            </button>

            <button onClick={() => { try { void getSupabase().auth.signOut(); setScreen('home'); } catch (error) { alert(error instanceof Error ? error.message : 'Déconnexion impossible.'); } }} className="w-full rounded-2xl border-2 border-red-100 bg-white py-4 text-red-600 font-bold">
              Déconnexion
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Accueil
  return (
    <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
      <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl shadow-slate-300/40">
        <div className="px-6 pt-7 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#0f9fb5] text-white flex items-center justify-center shadow-lg">
              <Globe2 size={27} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[28px] leading-none font-extrabold tracking-tight text-[#082f49]">
                Sendora
              </div>
              <div className="mt-1 text-[9px] tracking-[0.34em] text-slate-500">
                PLUS PROCHE DE CE QUI COMPTE
              </div>
            </div>
          </div>
          <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-[#082f49]">
            🇫🇷 FR⌄
          </button>
        </div>

        <div className="px-7 pt-5 text-center">
          <h1 className="text-[36px] leading-[1.05] font-extrabold tracking-tight text-[#082f49]">
            Envoyez de l’argent
            <br />
            partout dans le monde
          </h1>
          <p className="mt-4 text-[17px] leading-6 text-slate-500">
            Soutenez vos proches, payez vos services et réalisez vos projets,
            où qu’ils soient.
          </p>
        </div>

        <div className="mx-6 mt-7 rounded-[28px] bg-gradient-to-br from-[#073b5c] via-[#0f9fb5] to-[#7ed7d8] p-5 text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[20px] border-white/10" />
          <div className="absolute -left-16 -bottom-20 h-48 w-48 rounded-full border-[22px] border-white/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-sm text-white/75">
                Transfert international
              </div>
              <div className="mt-2 text-3xl font-bold">100 €</div>
              <div className="mt-1 text-sm text-white/80">≈ 65 500 FCFA</div>
            </div>
            <div className="h-16 w-16 rounded-full bg-white/15 flex items-center justify-center">
              <ArrowRight size={30} />
            </div>
          </div>
          <div className="relative mt-5 rounded-2xl bg-white/10 p-3 text-sm">
            Paris 🇫🇷 <span className="mx-2">→</span> Cotonou 🇧🇯
          </div>
        </div>

        <div className="px-6 pt-7 pb-8">
          <button
            onClick={() => setScreen('signup')}
            className="w-full rounded-full bg-[#0b7598] py-4 text-lg font-bold text-white shadow-lg shadow-cyan-900/15"
          >
            Créer un compte <ArrowRight className="inline ml-2" size={21} />
          </button>
          <button
            onClick={() => setScreen('login')}
            className="mt-3 w-full rounded-full border-2 border-[#cfe1e8] bg-white py-4 text-lg font-bold text-[#0b5575]"
          >
            Se connecter
          </button>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="mx-auto h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-[#0b7598]">
                <Zap size={20} />
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-500">
                Rapide
              </div>
            </div>
            <div>
              <div className="mx-auto h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-[#0b7598]">
                <Globe2 size={20} />
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-500">
                International
              </div>
            </div>
            <div>
              <div className="mx-auto h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-[#0b7598]">
                <LockKeyhole size={20} />
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-500">
                Sécurisé
              </div>
            </div>
          </div>

          <p className="mt-7 text-center text-xs text-slate-400">
            Transferts rapides, simples et sécurisés
          </p>
        </div>
      </section>
    </main>
  );
}

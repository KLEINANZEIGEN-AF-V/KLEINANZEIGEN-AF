'use client';

import { useState } from 'react';
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
} from 'lucide-react';

type Screen =
  | 'home'
  | 'signup'
  | 'dashboard'
  | 'transfer'
  | 'beneficiary'
  | 'summary'
  | 'confirmation';

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
              onClick={() => setScreen('dashboard')}
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
              onClick={() => setScreen('beneficiary')}
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
            <div className="rounded-2xl bg-[#eaf8fa] p-4 text-sm text-[#0b5575] mb-6">
              Entrez les coordonnées de la personne qui recevra{' '}
              <strong>{formatMoney(received)} FCFA</strong>.
            </div>

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

            <button
              onClick={() => setScreen('confirmation')}
              className="mt-6 w-full rounded-full bg-[#0b7598] py-4 text-lg font-bold text-white shadow-lg shadow-cyan-900/15"
            >
              Confirmer le transfert{' '}
              <ArrowRight className="inline ml-2" size={21} />
            </button>
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
            Votre demande de transfert a été enregistrée.
          </p>

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
            <strong>Mode démo :</strong> aucun argent réel n’est envoyé. La
            connexion à un prestataire de paiement et la vérification du
            bénéficiaire devront être ajoutées avant la mise en production.
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
            <button className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-[#0b7598]">
              <Bell size={20} />
            </button>
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
              onClick={() => setScreen('transfer')}
              className="w-full rounded-[24px] bg-[#0b7598] py-4 text-lg font-bold text-white shadow-lg shadow-cyan-900/15"
            >
              <Send className="inline mr-2" size={21} /> Envoyer de l'argent
            </button>
          </div>

          <div className="px-6 mt-7">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#082f49]">
                Derniers transferts
              </h2>
              <button className="text-sm font-semibold text-[#0b7598]">
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
              onClick={() => setScreen('transfer')}
              className="text-[#0b7598]"
            >
              <Send className="mx-auto" size={20} />
              <div className="mt-1 text-xs font-semibold">Transférer</div>
            </button>
            <button className="text-slate-400">
              <UserCircle className="mx-auto" size={20} />
              <div className="mt-1 text-xs font-semibold">Profil</div>
            </button>
            <button className="text-slate-400">
              <Settings className="mx-auto" size={20} />
              <div className="mt-1 text-xs font-semibold">Paramètres</div>
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
            onClick={() => setScreen('dashboard')}
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

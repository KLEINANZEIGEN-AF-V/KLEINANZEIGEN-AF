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

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [sendCountry, setSendCountry] = useState('🇫🇷 France');
  const [receiveCountry, setReceiveCountry] = useState('🇧🇯 Bénin');
  const [amount, setAmount] = useState('');

  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Mobile Money');

  const amountNumber = Number(amount.replace(',', '.')) || 0;

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

  if (screen === 'signup') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button
              onClick={() => setScreen('home')}
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]"
            >
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold text-[#082f49]">
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
              className="mt-6 w-full rounded-full bg-[#0b7598] py-4 text-lg font-bold text-white"
            >
              Continuer <ArrowRight className="inline ml-2" size={21} />
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'transfer') {
    return (
      <main className="min-h-screen bg-[#f5fbfd] flex items-center justify-center p-4">
        <section className="w-full max-w-md overflow-hidden rounded-[34px] bg-white shadow-2xl">
          <div className="px-6 pt-7 pb-5 flex items-center gap-3">
            <button
              onClick={() => setScreen('dashboard')}
              className="h-11 w-11 rounded-full border border-slate-200 flex items-center justify-center text-[#082f49]"
            >
              <ArrowLeft size={21} />
            </button>
            <div>
              <div className="text-2xl font-extrabold text-[#082f49]">
                Envoyer de l'argent
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Nouveau transfert international
              </div>
            </div>
          </div>

          <div className="px-6 pb-8">
            <div className="rounded-2xl bg-[#eaf8fa] p-4 text-sm text-[#0b5575] mb-6">
              Choisissez le pays d'envoi et le pays où le bénéficiaire recevra
              les fonds.
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
              className={`mt-6 w-full rounded-full py-4 text-lg font-bold ${
                amountNumber > 0
                  ? 'bg-[#0b7598] text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              Continuer <ArrowRight className="inline ml-2" size={21} />
            </button>
          </div>
        </section>
      </main>
    );
    }

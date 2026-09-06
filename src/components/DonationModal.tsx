import React, { useState } from 'react';
import {
  Heart,
  QrCode,
  CreditCard,
  CheckCircle2,
  X,
  Building2,
  Sparkles,
  ShieldCheck,
  Bitcoin,
} from 'lucide-react';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'pix' | 'card' | 'bitcoin';

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(50);
  const [customAmount, setCustomAmount] = useState<string>('50');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBtc, setCopiedBtc] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Card Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!isOpen) return null;

  const currentAmountValue =
    selectedAmount === 'custom' ? parseFloat(customAmount) || 0 : selectedAmount;

  const samplePixCode =
    '00020126580014br.gov.bcb.pix0136doacao.asconcer@elitenago.org.br5204000053039865405' +
    (currentAmountValue > 0 ? currentAmountValue.toFixed(2) : '50.00') +
    '5802BR5925ELITE NAGO E ASCONCER6012JUIZ DE FORA62070503***6304B7A9';

  const btcAddress = 'bc1qelitenagoasconcerjuizdefora2026donation';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(samplePixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCopyBtc = () => {
    navigator.clipboard.writeText(btcAddress);
    setCopiedBtc(true);
    setTimeout(() => setCopiedBtc(false), 3000);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const presetAmounts = [20, 50, 100, 200];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      {/* Compact Main Glass Dialog */}
      <div className="glass-panel max-w-lg w-full rounded-3xl p-5 sm:p-7 relative border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-neutral-950/95 backdrop-blur-2xl text-white my-auto overflow-hidden">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.06] text-neutral-300 border border-white/10 hover:border-white/30 hover:bg-white/10 hover:text-white transition-all cursor-pointer z-20"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="py-6 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Doação Registrada
              </span>
              <h3 className="text-2xl font-bold font-syne text-white">
                Muito Obrigado pelo seu Apoio!
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 text-xs text-neutral-300 leading-relaxed font-light">
              <p>
                Sua contribuição de{' '}
                <strong className="text-amber-300 font-semibold">
                  R$ {currentAmountValue.toFixed(2)}
                </strong>{' '}
                apoia diretamente o{' '}
                <strong className="text-white font-medium">
                  Hospital do Câncer de Juiz de Fora (ASCONCER)
                </strong>{' '}
                e as oficinas culturais de capoeira infantil.
              </p>
            </div>

            <InteractiveHoverButton
              onClick={resetAndClose}
              className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider"
            >
              Concluir
            </InteractiveHoverButton>
          </div>
        ) : (
          /* MAIN CLEAN DONATION FORM */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 pr-8 pb-3 border-b border-white/10">
              <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Heart className="w-4 h-4 fill-amber-400/30" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-syne text-white leading-tight">
                  Faça sua <span className="text-gold-gradient">Doação</span>
                </h2>
                <p className="text-[11px] text-neutral-400 font-light">
                  Iniciativa Solidária • Elite Nagô & ASCONCER
                </p>
              </div>
            </div>

            {/* Explanation Banner */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-xs text-neutral-300 leading-snug">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Apoie o{' '}
                <strong className="text-amber-300 font-medium">
                  Hospital do Câncer (ASCONCER)
                </strong>{' '}
                e os projetos sociais de capoeira para crianças.
              </span>
            </div>

            {/* Step 1: Select Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
                <span>1. Escolha o valor:</span>
                <span className="text-amber-300 font-bold font-syne text-sm">
                  R$ {currentAmountValue.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {presetAmounts.map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount(amt.toString());
                      }}
                      className={`py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer text-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                          : 'bg-white/[0.04] border border-white/10 text-neutral-300 hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-white'
                      }`}
                    >
                      R$ {amt}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setSelectedAmount('custom')}
                  className={`py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer text-center ${
                    selectedAmount === 'custom'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                      : 'bg-white/[0.04] border border-white/10 text-neutral-300 hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-white'
                  }`}
                >
                  Outro
                </button>
              </div>

              {/* Custom Input */}
              {selectedAmount === 'custom' && (
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-bold">
                    R$
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Digite o valor desejado"
                    className="w-full pl-11 pr-4 py-2 rounded-full bg-black/60 border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Payment Method Tabs */}
            <div className="space-y-2">
              <span className="block text-xs font-medium text-neutral-300">
                2. Forma de pagamento:
              </span>

              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Pix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cartão</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bitcoin')}
                  className={`py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
                    paymentMethod === 'bitcoin'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Bitcoin className="w-3.5 h-3.5" />
                  <span>Bitcoin</span>
                </button>
              </div>
            </div>

            {/* Payment Details Box */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              {/* PIX METHOD */}
              {paymentMethod === 'pix' && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Pix QR Frame */}
                  <div className="p-2 rounded-2xl bg-white shadow-lg shrink-0">
                    <svg
                      className="w-24 h-24 sm:w-28 sm:h-28"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="100" height="100" fill="white" />
                      <rect x="6" y="6" width="24" height="24" fill="#000" rx="3" />
                      <rect x="9" y="9" width="18" height="18" fill="#fff" rx="2" />
                      <rect x="12" y="12" width="12" height="12" fill="#000" rx="1" />

                      <rect x="70" y="6" width="24" height="24" fill="#000" rx="3" />
                      <rect x="73" y="9" width="18" height="18" fill="#fff" rx="2" />
                      <rect x="76" y="12" width="12" height="12" fill="#000" rx="1" />

                      <rect x="6" y="70" width="24" height="24" fill="#000" rx="3" />
                      <rect x="9" y="73" width="18" height="18" fill="#fff" rx="2" />
                      <rect x="12" y="76" width="12" height="12" fill="#000" rx="1" />

                      <rect x="35" y="35" width="30" height="30" fill="#d4af37" rx="6" />
                      <text
                        x="50"
                        y="54"
                        fontSize="13"
                        fontWeight="800"
                        textAnchor="middle"
                        fill="#000"
                        fontFamily="Montserrat, sans-serif"
                      >
                        PIX
                      </text>
                      <rect x="70" y="35" width="10" height="10" fill="#000" rx="1" />
                      <rect x="35" y="70" width="10" height="10" fill="#000" rx="1" />
                      <rect x="70" y="70" width="15" height="15" fill="#000" rx="2" />
                    </svg>
                  </div>

                  <div className="flex-1 w-full space-y-2.5 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-300 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>QR Code Pix Instantâneo</span>
                    </div>
                    <p className="text-xs text-neutral-300 font-light leading-relaxed">
                      Escaneie o código pelo app do seu banco ou copie a chave Pix Copia e Cola.
                    </p>

                    <InteractiveHoverButton
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider"
                    >
                      {copiedPix ? 'Chave Pix Copiada!' : 'Copiar Chave Pix'}
                    </InteractiveHoverButton>
                  </div>
                </div>
              )}

              {/* BITCOIN METHOD */}
              {paymentMethod === 'bitcoin' && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2 rounded-2xl bg-white shadow-lg shrink-0">
                    <svg
                      className="w-24 h-24 sm:w-28 sm:h-28"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="100" height="100" fill="white" />
                      <rect x="6" y="6" width="24" height="24" fill="#f7931a" rx="3" />
                      <rect x="70" y="6" width="24" height="24" fill="#f7931a" rx="3" />
                      <rect x="6" y="70" width="24" height="24" fill="#f7931a" rx="3" />
                      <circle cx="50" cy="50" r="16" fill="#f7931a" />
                      <text
                        x="50"
                        y="56"
                        fontSize="18"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill="#fff"
                      >
                        ₿
                      </text>
                    </svg>
                  </div>

                  <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                    <span className="block text-xs text-amber-300 font-bold">
                      Endereço Bitcoin (BTC):
                    </span>
                    <p className="text-[11px] font-mono text-neutral-300 break-all bg-black/60 p-2 rounded-xl border border-white/10">
                      {btcAddress}
                    </p>

                    <InteractiveHoverButton
                      type="button"
                      onClick={handleCopyBtc}
                      className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider"
                    >
                      {copiedBtc ? 'Endereço Copiado!' : 'Copiar Endereço BTC'}
                    </InteractiveHoverButton>
                  </div>
                </div>
              )}

              {/* CARD METHOD */}
              {paymentMethod === 'card' && (
                <form onSubmit={handleCardSubmit} className="space-y-3 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1">
                        Nome Impresso no Cartão
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="NOME COMO NO CARTÃO"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-amber-100 uppercase focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1">
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, '')
                            .replace(/(.{4})/g, '$1 ')
                            .trim();
                          setCardNumber(val);
                        }}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-amber-100 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1">
                        Validade
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length >= 3) {
                            setCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                          } else {
                            setCardExpiry(val);
                          }
                        }}
                        placeholder="MM/AA"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-amber-100 text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-amber-100 text-center focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <InteractiveHoverButton
                      type="submit"
                      className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider"
                    >
                      Confirmar R$ {currentAmountValue.toFixed(2)}
                    </InteractiveHoverButton>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Transação Segura SSL
              </span>
              <span>Elite Nagô • Juiz de Fora - MG</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationModal;

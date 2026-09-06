import React, { useState } from 'react';
import {
  QrCode,
  CreditCard,
  CheckCircle2,
  X,
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
    '00020126580014br.gov.bcb.pix0136doacao.ascomcer@elitenago.org.br5204000053039865405' +
    (currentAmountValue > 0 ? currentAmountValue.toFixed(2) : '50.00') +
    '5802BR5925ELITE NAGO E ASCOMCER6012JUIZ DE FORA62070503***6304B7A9';

  const btcAddress = 'bc1qelitenagoascomcerjuizdefora2026donation';

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
      <div className="glass-panel max-w-lg w-full max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-6 relative border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-neutral-950/95 backdrop-blur-2xl text-white my-auto custom-scrollbar">
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
            <div className="w-16 h-16 rounded-full bg-[#EEDC9A]/20 border border-[#EEDC9A]/60 flex items-center justify-center mx-auto text-[#EEDC9A] shadow-[0_0_25px_rgba(238,220,154,0.35)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#EEDC9A] uppercase tracking-wider block">
                Doação Registrada
              </span>
              <h3 className="text-2xl font-bold font-syne text-white">
                Muito Obrigado pelo seu Apoio!
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 text-xs text-neutral-300 leading-relaxed font-light">
              <p>
                Sua contribuição de{' '}
                <strong className="text-[#EEDC9A] font-semibold">
                  R$ {currentAmountValue.toFixed(2)}
                </strong>{' '}
                apoia diretamente o{' '}
                <strong className="text-white font-medium">
                  Hospital do Câncer de Juiz de Fora (ASCOMCER)
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
            {/* Header without heart icon */}
            <div className="pr-8 pb-3 border-b border-white/10">
              <h2 className="text-xl sm:text-2xl font-bold font-syne text-white leading-tight">
                Faça sua <span className="text-gold-gradient">Doação</span>
              </h2>
              <p className="text-[11px] text-neutral-400 font-light mt-0.5">
                Iniciativa Solidária • Elite Nagô & ASCOMCER
              </p>
            </div>

            {/* Banner ASCOMCER & Description */}
            <div className="space-y-2">
              <div className="relative overflow-hidden rounded-2xl border border-[#EEDC9A]/20 shadow-md bg-neutral-900">
                <img
                  src="/img/ascomcer_doe.png"
                  alt="Campanha Doe para a ASCOMCER"
                  className="w-full h-auto object-cover rounded-2xl block"
                />
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-light px-1">
                Parte da sua doação será destinada a milhares de pessoas que passam por tratamento de câncer na <strong className="text-[#EEDC9A] font-medium">ASCOMCER</strong> e crianças em situações de vulnerabilidade.
              </p>
            </div>

            {/* Step 1: Select Amount */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-300">
                <span>1. Escolha o valor:</span>
                <span className="text-[#EEDC9A] font-bold font-syne text-sm">
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
                          ? 'bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] text-black font-extrabold shadow-[0_0_15px_rgba(238,220,154,0.35)] scale-105 border border-[#EEDC9A]/50'
                          : 'bg-white/[0.04] border border-white/10 text-neutral-300 hover:border-[#EEDC9A]/40 hover:bg-[#EEDC9A]/10 hover:text-white'
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
                      ? 'bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] text-black font-extrabold shadow-[0_0_15px_rgba(238,220,154,0.35)] scale-105 border border-[#EEDC9A]/50'
                      : 'bg-white/[0.04] border border-white/10 text-neutral-300 hover:border-[#EEDC9A]/40 hover:bg-[#EEDC9A]/10 hover:text-white'
                  }`}
                >
                  Outro
                </button>
              </div>

              {/* Custom Input */}
              {selectedAmount === 'custom' && (
                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#EEDC9A] font-bold">
                    R$
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Digite o valor desejado"
                    className="w-full pl-11 pr-4 py-2 rounded-full bg-black/60 border border-white/15 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#EEDC9A] focus:ring-1 focus:ring-[#EEDC9A]/50 transition-all"
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
                      ? 'bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] text-black font-extrabold shadow-[0_0_15px_rgba(238,220,154,0.3)]'
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
                      ? 'bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] text-black font-extrabold shadow-[0_0_15px_rgba(238,220,154,0.3)]'
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
                      ? 'bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887] text-black font-extrabold shadow-[0_0_15px_rgba(238,220,154,0.3)]'
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

                      <rect x="35" y="35" width="30" height="30" fill="#EEDC9A" rx="6" />
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
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#EEDC9A] font-bold">
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
                    <span className="block text-xs text-[#EEDC9A] font-bold">
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
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-[#F5E8C7] uppercase focus:outline-none focus:border-[#EEDC9A]"
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
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#EEDC9A]"
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
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-[#F5E8C7] text-center focus:outline-none focus:border-[#EEDC9A]"
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
                        className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-[#F5E8C7] text-center focus:outline-none focus:border-[#EEDC9A]"
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
                <ShieldCheck className="w-3.5 h-3.5 text-[#EEDC9A]" />
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

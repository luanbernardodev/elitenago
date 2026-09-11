import React, { useState } from 'react';
import { Phone, Mail, MapPin, Instagram, Youtube, AlertCircle } from 'lucide-react';
import { Button as StatefulButton } from '@/components/ui/stateful-button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import {
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeMessage,
} from '@/lib/security';

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex w-full flex-col space-y-1.5', className)}>
      {children}
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#EEDC9A] to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#EED89F] to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

export const ContactFooter: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { sanitized } = sanitizeName(e.target.value);
    setFormData((prev) => ({ ...prev, name: sanitized }));
    if (errorMessage) setErrorMessage(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { sanitized } = sanitizePhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: sanitized }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { sanitized } = sanitizeEmail(e.target.value);
    setFormData((prev) => ({ ...prev, email: sanitized }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { sanitized } = sanitizeMessage(e.target.value);
    setFormData((prev) => ({ ...prev, message: sanitized }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSendMessage = async () => {
    setErrorMessage(null);

    // Strict sanitization & validation
    const nameValidation = sanitizeName(formData.name);
    const emailValidation = sanitizeEmail(formData.email);
    const phoneValidation = sanitizePhone(formData.phone);
    const messageValidation = sanitizeMessage(formData.message);

    if (!nameValidation.isValid) {
      setErrorMessage('Por favor, digite um nome válido (mínimo 2 caracteres).');
      throw new Error('Nome inválido.');
    }

    if (!phoneValidation.isValid) {
      setErrorMessage('Por favor, informe um telefone/WhatsApp válido com DDD.');
      throw new Error('Telefone inválido.');
    }

    if (!emailValidation.isValid) {
      setErrorMessage('Por favor, informe um e-mail válido.');
      throw new Error('E-mail inválido.');
    }

    if (!messageValidation.isValid) {
      setErrorMessage('Por favor, digite uma mensagem válida.');
      throw new Error('Mensagem inválida.');
    }

    // Payload sanitizado e imune a scripts e SQL injection
    const cleanPayload = {
      name: nameValidation.sanitized,
      email: emailValidation.sanitized,
      phone: phoneValidation.sanitized,
      message: messageValidation.sanitized,
      sentAt: new Date().toISOString(),
    };

    console.log('Secure Contact Form Payload:', cleanPayload);

    // Simulate sending message API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Clear form after success
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', message: '' });
      setErrorMessage(null);
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <footer id="contato" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Contact Section Box with Glassmorphism & Light Refined Border */}
      <div className="mb-12 sm:mb-16">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 hover:border-[#EEDC9A]/30 rounded-3xl p-6 sm:p-12 shadow-2xl transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Form Info */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-5xl font-black font-syne text-white uppercase tracking-tight">
                Entre para a <br />
                <span className="text-gold-gradient">Elite</span>
              </h2>

              <p className="text-sm text-neutral-300 font-light leading-relaxed">
                Preencha o formulário para agendar sua primeira aula experimental gratuita ou tirar dúvidas sobre o grupo e apresentações.
              </p>

              <div className="space-y-3 pt-2 text-xs font-mono text-neutral-300">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#EEDC9A]" />
                  <span>WhatsApp: (32) 98407-7391</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#EEDC9A]" />
                  <span>contato@elitenago.com.br</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#EEDC9A]" />
                  <span>Juiz de Fora - MG / Brasil</span>
                </div>
              </div>
            </div>

            {/* Aceternity Form Inputs */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LabelInputContainer>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Seu nome"
                      maxLength={80}
                      autoComplete="name"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="phone">WhatsApp / Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(32) 99999-9999"
                      maxLength={30}
                      autoComplete="tel"
                    />
                  </LabelInputContainer>
                </div>

                <LabelInputContainer>
                  <Label htmlFor="email">Seu E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleEmailChange}
                    placeholder="seuemail@exemplo.com"
                    maxLength={120}
                    autoComplete="email"
                  />
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="message">Mensagem ou Dúvida</Label>
                  <Textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleMessageChange}
                    placeholder="Tenho interesse em fazer uma aula no núcleo..."
                    maxLength={1500}
                  />
                </LabelInputContainer>

                <div className="pt-2">
                  <StatefulButton
                    type="submit"
                    onClick={handleSendMessage}
                    loadingText="Validando e Enviando..."
                    successText="Solicitação Enviada com Sucesso!"
                    className="group/btn relative w-full py-4 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md overflow-hidden"
                  >
                    <span>Enviar Solicitação</span>
                    <BottomGradient />
                  </StatefulButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8 text-xs text-neutral-400 font-mono">
        <div className="flex items-center gap-3">
          <img src="/en.svg" alt="Elite Nagô" className="h-6 w-auto" />
          <span>© {new Date().getFullYear()} Grupo Elite Nagô de Capoeira. Todos os direitos reservados.</span>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/60 border border-white/15 flex items-center justify-center hover:bg-white hover:text-black transition-all text-neutral-300"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/60 border border-white/15 flex items-center justify-center hover:bg-white hover:text-black transition-all text-neutral-300"
            aria-label="YouTube"
          >
            <Youtube className="w-4 h-4" />
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/60 border border-white/15 flex items-center justify-center hover:bg-white hover:text-black transition-all text-neutral-300"
            aria-label="X (antigo Twitter)"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default ContactFooter;

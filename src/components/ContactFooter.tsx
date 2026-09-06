import React, { useState } from 'react';
import { Phone, Mail, MapPin, Instagram, Youtube } from 'lucide-react';
import { Button as StatefulButton } from '@/components/ui/stateful-button';
import { BorderGlow } from './BorderGlow';

export const ContactFooter: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSendMessage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Check if HTML form is valid
    const form = e.currentTarget.closest('form');
    if (form && !form.checkValidity()) {
      form.reportValidity();
      throw new Error('Preencha os campos obrigatórios.');
    }

    // Simulate sending message API
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Clear form after success
    setTimeout(() => {
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <footer id="contato" className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Contact Section Box with BorderGlow */}
      <div className="mb-12 sm:mb-16">
        <BorderGlow
          borderRadius={28}
          glowColor="45 50 65"
          backgroundColor="#08080a"
          colors={['#F6E7B8', '#EED89F', '#E3C887']}
          className="p-5 sm:p-12"
        >
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

            {/* Form Inputs */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-[#EEDC9A]/70"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">WhatsApp / Telefone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-[#EEDC9A]/70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">Seu E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-[#EEDC9A]/70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-300 mb-1">Mensagem ou Dúvida</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tenho interesse em fazer uma aula no núcleo..."
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-[#EEDC9A]/70 resize-none"
                  />
                </div>

                <div className="pt-1">
                  <StatefulButton
                    type="submit"
                    onClick={handleSendMessage}
                    loadingText="Enviando..."
                    successText="Solicitação Enviada!"
                    className="w-full py-4 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-md"
                  >
                    Enviar Solicitação
                  </StatefulButton>
                </div>
              </form>
            </div>
          </div>
        </BorderGlow>
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

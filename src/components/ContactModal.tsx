import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, lang }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: 'fefe9987-1d25-45f4-8f72-8d82ef6f152d',
          name,
          email,
          message,
          subject: `RoadToLoad kapcsolatfelvétel: ${name}`,
        }),
      });

      if (response.ok) {
        setIsSent(true);
      } else {
        setIsSent(true);
      }
    } catch {
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#0F0F0F] border border-white/15 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]">
          <div>
            <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold block mb-0.5">
              {t.contactSubtitleHeader}
            </span>
            <h3 className="font-black text-lg text-[#FDD835] tracking-tight">{t.contactTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isSent ? (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-black text-sm text-[#EEEEEE] mb-1">
                {lang === 'hu' ? 'Köszönjük az üzenetet!' : 'Message Sent Successfully!'}
              </h4>
              <p className="text-xs text-white/50 mb-4 max-w-xs">{t.msgSent}</p>
              <button
                type="button"
                onClick={() => {
                  setIsSent(false);
                  onClose();
                }}
                className="py-2 px-5 bg-white/10 hover:bg-white/20 text-[#EEEEEE] font-bold uppercase tracking-wider rounded-xl text-xs cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <p className="text-xs text-white/50 mb-1 leading-relaxed">{t.contactSubtitle}</p>

              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.placeholderName}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#EEEEEE] placeholder-white/30 focus:outline-none focus:border-[#FDD835]"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholderEmail}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#EEEEEE] placeholder-white/30 focus:outline-none focus:border-[#FDD835]"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.placeholderMsg}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#EEEEEE] placeholder-white/30 focus:outline-none focus:border-[#FDD835] resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-white/40 font-mono">hello@roadtoload.hu</span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FDD835] hover:bg-[#FDD835]/90 text-[#111111] font-black rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t.sending : t.btnSend}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, CircleCheck, Star, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureName }) => {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Header */}
        <div className="h-32 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-950/90"></div>
            
            <div className="relative z-10 text-center transform translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-yellow-500/30">
                   <Crown className="w-8 h-8 text-white fill-white" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">Desbloqueie o ProTrader Premium</h3>
            </div>

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white/70 hover:text-white rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content Body */}
        <div className="p-8 pt-4 flex-1 flex flex-col">
            <div className="text-center mb-8">
               {featureName && (
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-xs font-bold uppercase tracking-wider mb-3">
                   <ShieldCheck className="w-3 h-3" /> Recurso Bloqueado: {featureName}
                 </div>
               )}
               <p className="text-slate-400 text-sm leading-relaxed">
                 Você está utilizando o plano gratuito. Atualize agora para ter acesso ilimitado a todas as ferramentas profissionais.
               </p>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-neon-green/10 rounded text-neon-green"><Zap className="w-4 h-4" /></div>
                  <span className="text-sm text-slate-300">Acesso ao <strong>Mapa Trader Gamificado</strong></span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-neon-green/10 rounded text-neon-green"><TrendingUp className="w-4 h-4" /></div>
                  <span className="text-sm text-slate-300">Estatísticas avançadas e <strong>Evolução Patrimonial</strong></span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-neon-green/10 rounded text-neon-green"><Star className="w-4 h-4" /></div>
                  <span className="text-sm text-slate-300">Histórico completo de <strong>Mindset e Disciplina</strong></span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-neon-green/10 rounded text-neon-green"><CircleCheck className="w-4 h-4" /></div>
                  <span className="text-sm text-slate-300">Sem limites de estratégias ou registros</span>
               </div>
            </div>

            <button 
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-slate-900 font-black text-lg rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              onClick={() => {
                 // Redirect to plan selection or handle upgrade logic
                 // In this demo, we can redirect to login page where plans are shown or just close
                 onClose();
                 window.location.hash = '/login'; 
              }}
            >
               <Crown className="w-5 h-5 fill-slate-900" />
               QUERO SER PREMIUM
            </button>
            
            <p className="text-center text-xs text-slate-500 mt-4">
               Apenas R$ 49,90/mês. Cancele quando quiser.
            </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UpgradeModal;
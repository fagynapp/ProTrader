
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, CircleAlert, ShieldCheck, User, Shield, Crown, Check, X } from 'lucide-react';
import { MOCK_USERS } from '../constants';

const Login = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'LOGIN' | 'PLANS'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = (emailToFind: string) => {
    setIsLoading(true);
    setError('');

    // Simulate Network Request
    setTimeout(() => {
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === emailToFind.toLowerCase());
      
      if (foundUser) {
         localStorage.setItem('protrader_user', JSON.stringify(foundUser));
         if (foundUser.role === 'ADMIN') navigate('/admin');
         else navigate('/');
      } else {
         // Fallback for manual generic login if not in mock
         const role = emailToFind.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';
         const fallbackUser = {
            role,
            name: role === 'ADMIN' ? 'Administrador' : 'Trader Convidado',
            email: emailToFind,
            status: 'ACTIVE',
            plan: 'BASIC' // Default fallback
         };
         localStorage.setItem('protrader_user', JSON.stringify(fallbackUser));
         if (role === 'ADMIN') navigate('/admin');
         else navigate('/');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    performLogin(email);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl"></div>
      </div>

      <div className={`w-full ${view === 'PLANS' ? 'max-w-4xl' : 'max-w-md'} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative z-10 overflow-hidden transition-all duration-500 ease-in-out`}>
         {/* Decoration Line */}
         <div className="h-1 w-full bg-gradient-to-r from-neon-green to-neon-cyan"></div>
         
         <div className="p-8 pb-6">
            
            {/* Header */}
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-gradient-to-br from-neon-green to-neon-cyan rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-neon-cyan/20">
                  <ShieldCheck className="w-8 h-8 text-slate-900" />
               </div>
               <h1 className="text-2xl font-bold text-white tracking-tight">
                  PRO<span className="text-neon-green">TRADER</span>
               </h1>
               <p className="text-slate-500 text-sm mt-2">
                  Plataforma de Alta Performance
               </p>
            </div>

            {view === 'LOGIN' && (
               <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <form onSubmit={handleManualLogin} className="space-y-5">
                     {error && (
                       <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                          <CircleAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
                          <p className="text-xs text-rose-200">{error}</p>
                       </div>
                     )}

                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">E-mail</label>
                        <div className="relative">
                           <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                           <input 
                             type="email" 
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                             placeholder="Digite seu e-mail..."
                             value={email}
                             onChange={(e) => setEmail(e.target.value)}
                           />
                        </div>
                     </div>

                     <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Senha</label>
                        <div className="relative">
                           <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                           <input 
                             type="password" 
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan transition-colors"
                             placeholder="••••••••"
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                           />
                        </div>
                     </div>

                     <button 
                       type="submit" 
                       disabled={isLoading}
                       className="w-full py-3.5 bg-gradient-to-r from-neon-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                     >
                       {isLoading ? (
                          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                       ) : (
                          <>Acessar Plataforma <ChevronRight className="w-4 h-4" /></>
                       )}
                     </button>
                  </form>
                  
                  <div className="mt-6 text-center">
                     <p className="text-sm text-slate-500">
                        Ainda não tem conta?{' '}
                        <button onClick={() => setView('PLANS')} className="text-neon-cyan font-bold hover:underline">
                           Ver Planos
                        </button>
                     </p>
                  </div>

                  {/* DEV QUICK ACTIONS */}
                  <div className="mt-8 pt-6 border-t border-slate-800">
                     <p className="text-xs text-slate-500 text-center mb-4 uppercase font-bold tracking-wider">
                        Contas de Demonstração (Clique para testar)
                     </p>
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => performLogin('joaosilva@exemplo.com')}
                          disabled={isLoading}
                          className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group relative overflow-hidden"
                        >
                           <User className="w-5 h-5 text-slate-400 mb-1 group-hover:scale-110 transition-transform" />
                           <span className="text-xs font-bold text-slate-300">Plano Básico</span>
                           <span className="text-[10px] text-slate-500">João Silva</span>
                        </button>
                        <button 
                          onClick={() => performLogin('marianatorres@exemplo.com')}
                          disabled={isLoading}
                          className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all group relative overflow-hidden"
                        >
                           <div className="absolute top-0 right-0 p-1">
                              <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                           </div>
                           <User className="w-5 h-5 text-neon-cyan mb-1 group-hover:scale-110 transition-transform" />
                           <span className="text-xs font-bold text-slate-300">Plano Premium</span>
                           <span className="text-[10px] text-slate-500">Mariana Torres</span>
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {view === 'PLANS' && (
               <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-center mb-8">
                     <h2 className="text-xl font-bold text-white">Escolha o plano ideal para sua evolução</h2>
                     <p className="text-slate-400 text-sm">Comece grátis ou desbloqueie o poder máximo.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* BASIC PLAN */}
                     <div className="border border-slate-700 rounded-xl p-6 bg-slate-950/50 flex flex-col hover:border-slate-500 transition-colors">
                        <div className="mb-4">
                           <h3 className="text-lg font-bold text-white">Plano Gratuito</h3>
                           <p className="text-2xl font-bold text-slate-300">R$ 0<span className="text-sm font-normal text-slate-500">/mês</span></p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                           <li className="flex items-center gap-2 text-sm text-slate-300"><Check className="w-4 h-4 text-neon-green" /> Dashboard simplificado</li>
                           <li className="flex items-center gap-2 text-sm text-slate-300"><Check className="w-4 h-4 text-neon-green" /> Registro básico de trades</li>
                           <li className="flex items-center gap-2 text-sm text-slate-300"><Check className="w-4 h-4 text-neon-green" /> Mindset (Dia atual)</li>
                           <li className="flex items-center gap-2 text-sm text-slate-500"><X className="w-4 h-4" /> Sem Mapa Trader</li>
                           <li className="flex items-center gap-2 text-sm text-slate-500"><X className="w-4 h-4" /> Sem gráficos avançados</li>
                           <li className="flex items-center gap-2 text-sm text-slate-500"><X className="w-4 h-4" /> Sem histórico emocional</li>
                        </ul>
                        <button 
                           onClick={() => performLogin('joaosilva@exemplo.com')}
                           className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-slate-700"
                        >
                           Criar Conta Gratuita
                        </button>
                     </div>

                     {/* PREMIUM PLAN */}
                     <div className="border border-neon-cyan/50 rounded-xl p-6 bg-slate-900 relative flex flex-col shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-neon-cyan text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                           Recomendado
                        </div>
                        <div className="mb-4">
                           <h3 className="text-lg font-bold text-white flex items-center gap-2">Plano Premium <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" /></h3>
                           <p className="text-2xl font-bold text-neon-cyan">R$ 49<span className="text-sm font-normal text-slate-500">/mês</span></p>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                           <li className="flex items-center gap-2 text-sm text-white"><Check className="w-4 h-4 text-neon-cyan" /> <strong>Acesso total</strong> à plataforma</li>
                           <li className="flex items-center gap-2 text-sm text-white"><Check className="w-4 h-4 text-neon-cyan" /> <strong>Mapa Trader Gamificado</strong></li>
                           <li className="flex items-center gap-2 text-sm text-white"><Check className="w-4 h-4 text-neon-cyan" /> Mindset completo & Histórico</li>
                           <li className="flex items-center gap-2 text-sm text-white"><Check className="w-4 h-4 text-neon-cyan" /> Estatísticas e Gráficos Pro</li>
                           <li className="flex items-center gap-2 text-sm text-white"><Check className="w-4 h-4 text-neon-cyan" /> Filtros avançados e Trilhas</li>
                        </ul>
                        <button 
                           onClick={() => performLogin('marianatorres@exemplo.com')}
                           className="w-full py-3 bg-neon-cyan hover:bg-cyan-600 text-slate-900 font-bold rounded-lg transition-colors shadow-lg shadow-neon-cyan/20"
                        >
                           Assinar Premium
                        </button>
                     </div>
                  </div>

                  <div className="mt-6 text-center">
                     <button onClick={() => setView('LOGIN')} className="text-slate-500 hover:text-white text-sm">
                        Já tem conta? Fazer Login
                     </button>
                  </div>
               </div>
            )}

         </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CirclePlus, BarChart2, LayoutDashboard, Wallet, ArrowUpRight, 
  TrendingUp, Activity, Settings, RefreshCw, Image as ImageIcon, 
  Plus, Trash2, X, Upload, Quote as QuoteIcon
} from 'lucide-react';
import { KPI_STATS } from '../constants';

// Default Quotes
const DEFAULT_QUOTES = [
  { text: "O mercado é um dispositivo para transferir dinheiro dos impacientes para os pacientes.", author: "Warren Buffett" },
  { text: "Não importa se você está certo ou errado, mas sim quanto dinheiro você ganha quando está certo e quanto perde quando está errado.", author: "George Soros" },
  { text: "O risco vem de não saber o que você está fazendo.", author: "Warren Buffett" },
  { text: "A disciplina é a ponte entre metas e realizações.", author: "Jim Rohn" },
  { text: "Corte suas perdas cedo e deixe seus lucros correrem.", author: "Jesse Livermore" }
];

interface Quote {
  text: string;
  author: string;
}

const Home = () => {
  const navigate = useNavigate();

  // --- State Management ---
  
  // Background Image State (persisted in localStorage)
  const [bgImage, setBgImage] = useState<string | null>(() => localStorage.getItem('protrade_home_bg'));
  
  // Quotes State (persisted in localStorage)
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('protrade_quotes');
    return saved ? JSON.parse(saved) : DEFAULT_QUOTES;
  });
  
  // Current displayed quote INDEX
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  // Automatic Quote Rotation (Billboard Effect)
  useEffect(() => {
    if (quotes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [quotes.length]);

  // Persist Background Image
  useEffect(() => {
    if (bgImage) localStorage.setItem('protrade_home_bg', bgImage);
    else localStorage.removeItem('protrade_home_bg');
  }, [bgImage]);

  // Persist Quotes
  useEffect(() => {
    localStorage.setItem('protrade_quotes', JSON.stringify(quotes));
  }, [quotes]);

  // --- Handlers ---

  const handleNextQuote = () => {
    if (quotes.length > 0) {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBgImage = () => {
    if (window.confirm('Remover a imagem de fundo personalizada?')) {
      setBgImage(null);
    }
  };

  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuoteText.trim() && newQuoteAuthor.trim()) {
      setQuotes([...quotes, { text: newQuoteText, author: newQuoteAuthor }]);
      setNewQuoteText('');
      setNewQuoteAuthor('');
    }
  };

  const handleDeleteQuote = (index: number) => {
    if (window.confirm('Excluir esta frase?')) {
      const newQuotes = quotes.filter((_, i) => i !== index);
      setQuotes(newQuotes.length > 0 ? newQuotes : DEFAULT_QUOTES);
      // Reset index to safe bounds
      setCurrentQuoteIndex(0);
    }
  };

  // Get current quote object safely
  const currentQuote = quotes[currentQuoteIndex] || DEFAULT_QUOTES[0];

  return (
    <div className="space-y-8">
      {/* Header with Custom Background - Compact Version */}
      <header 
        className="relative overflow-hidden rounded-xl border border-slate-700 p-6 min-h-[180px] flex flex-col justify-center group transition-all duration-500"
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay logic */}
        <div className={`absolute inset-0 transition-colors duration-500 ${bgImage ? 'bg-slate-950/85 backdrop-blur-[1px]' : 'bg-gradient-to-r from-slate-900 to-slate-800'}`} />
        
        {/* Fallback Decorative Gradient if no image */}
        {!bgImage && (
           <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-neon-cyan/10 to-transparent pointer-events-none"></div>
        )}

        {/* Content */}
        <div className="relative z-10 w-full flex justify-between items-center">
          <div className="w-full pr-12">
            <h1 className="text-2xl font-bold text-white mb-3 drop-shadow-lg flex items-center gap-2">
              Bom dia, <span className="text-neon-cyan">Trader</span>.
            </h1>
            
            {/* "Outdoor" Style Quote with Animation Key */}
            <div className="max-w-3xl relative pl-4 border-l-2 border-neon-green">
               <div key={currentQuoteIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-slate-200 text-base md:text-lg italic font-medium leading-relaxed drop-shadow-md">
                    "{currentQuote.text}"
                  </p>
                  <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-wider flex items-center gap-2">
                    — {currentQuote.author}
                  </p>
               </div>
            </div>
          </div>
          
          {/* Header Controls (Compact & Visible on Hover) */}
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-4 top-4">
            <button
              onClick={handleNextQuote}
              className="p-2 bg-slate-900/80 hover:bg-neon-cyan hover:text-slate-950 text-slate-300 rounded-lg backdrop-blur border border-slate-700 transition-colors shadow-lg"
              title="Próxima Frase"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-slate-900/80 hover:bg-neon-cyan hover:text-slate-950 text-slate-300 rounded-lg backdrop-blur border border-slate-700 transition-colors shadow-lg"
              title="Personalizar Capa e Frases"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar for "Outdoor" Timing */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-slate-800 w-full">
           <div key={currentQuoteIndex} className="h-full bg-neon-green/50 w-full animate-[progress_8s_linear]"></div>
        </div>
      </header>

      {/* Shortcuts */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/trades')}
            className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-neon-green transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] text-left"
          >
            <div className="bg-neon-green/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-neon-green group-hover:scale-110 transition-transform">
              <CirclePlus className="w-6 h-6" />
            </div>
            <span className="block text-white font-medium">Registrar Trade</span>
            <span className="text-xs text-slate-500">Novo diário</span>
          </button>

          <button 
            onClick={() => navigate('/strategies')}
            className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-neon-cyan transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] text-left"
          >
            <div className="bg-neon-cyan/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-neon-cyan group-hover:scale-110 transition-transform">
              <BarChart2 className="w-6 h-6" />
            </div>
            <span className="block text-white font-medium">Estratégias</span>
            <span className="text-xs text-slate-500">Minha biblioteca</span>
          </button>

          <button 
            onClick={() => navigate('/dashboard')}
            className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] text-left"
          >
            <div className="bg-purple-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <span className="block text-white font-medium">Dashboard</span>
            <span className="text-xs text-slate-500">Analytics completo</span>
          </button>

          <button 
            onClick={() => navigate('/finance')}
            className="group p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-orange-500 transition-all hover:shadow-[0_0_15px_rgba(249,115,22,0.1)] text-left"
          >
            <div className="bg-orange-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-orange-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="block text-white font-medium">Financeiro</span>
            <span className="text-xs text-slate-500">Notas e Impostos</span>
          </button>
        </div>
      </section>

      {/* Quick Stats */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Performance Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-sm font-medium">Winrate</span>
              <TrendingUp className="w-4 h-4 text-neon-green" />
            </div>
            <div className="text-2xl font-bold text-white">{KPI_STATS.winRate}%</div>
            <div className="text-xs text-neon-green mt-1 flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +2.4% vs mês anterior
            </div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-sm font-medium">Fator de Lucro</span>
              <Activity className="w-4 h-4 text-neon-cyan" />
            </div>
            <div className="text-2xl font-bold text-white">{KPI_STATS.riskReturn}</div>
            <div className="text-xs text-slate-400 mt-1">Risco x Retorno Médio</div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
             <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-sm font-medium">Total Operações</span>
              <BarChart2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{KPI_STATS.totalTrades}</div>
            <div className="text-xs text-slate-400 mt-1">Neste ano</div>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-2 relative z-10">
              <span className="text-slate-500 text-sm font-medium">P&L Acumulado</span>
              <Wallet className="w-4 h-4 text-neon-green" />
            </div>
            <div className="text-2xl font-bold text-white font-mono relative z-10">
              {KPI_STATS.totalPnL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
             <div className="absolute -bottom-4 -right-4 opacity-10 text-neon-green">
               <TrendingUp size={80} />
             </div>
          </div>

        </div>
      </section>

      {/* Customization Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-neon-cyan" /> Personalizar Home
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Section 1: Background Image */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Imagem de Fundo
                </h3>
                
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <div className="aspect-[3/1] w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative mb-4 group">
                    {bgImage ? (
                      <img src={bgImage} alt="Background Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center">
                        <span className="text-slate-500 text-sm font-medium">Padrão (Gradiente)</span>
                      </div>
                    )}
                    
                    {/* Preview Overlay Controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                       {bgImage && (
                         <button 
                           onClick={removeBgImage}
                           className="px-3 py-1.5 bg-rose-500/90 hover:bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 backdrop-blur"
                         >
                           <Trash2 className="w-3 h-3" /> Remover
                         </button>
                       )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 hover:border-neon-cyan/50 text-neon-cyan font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Upload className="w-4 h-4" /> Carregar Nova Imagem
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">Recomendado: 1920x1080 ou superior. A imagem será escurecida automaticamente para garantir a leitura do texto.</p>
                </div>
              </section>

              {/* Section 2: Motivation Quotes */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <QuoteIcon className="w-4 h-4" /> Frases Motivacionais
                </h3>

                {/* Add New Quote Form */}
                <form onSubmit={handleAddQuote} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                   <div className="space-y-1">
                     <label className="text-xs text-slate-400">Nova Frase</label>
                     <textarea 
                       value={newQuoteText}
                       onChange={(e) => setNewQuoteText(e.target.value)}
                       placeholder="Digite a frase motivacional aqui..."
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-neon-green outline-none resize-none h-20"
                       required
                     />
                   </div>
                   <div className="flex gap-3">
                     <div className="flex-1 space-y-1">
                       <label className="text-xs text-slate-400">Autor</label>
                       <input 
                         type="text"
                         value={newQuoteAuthor}
                         onChange={(e) => setNewQuoteAuthor(e.target.value)}
                         placeholder="Ex: Warren Buffett"
                         className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-neon-green outline-none"
                         required
                       />
                     </div>
                     <button 
                       type="submit"
                       className="self-end px-4 py-2.5 bg-neon-green hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                     >
                       <Plus className="w-4 h-4" /> Adicionar
                     </button>
                   </div>
                </form>

                {/* Quotes List */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">Frases cadastradas ({quotes.length}):</p>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {quotes.map((quote, idx) => (
                      <div key={idx} className="group flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600 transition-colors">
                        <div className="flex-1 pr-4">
                          <p className="text-sm text-slate-300 italic">"{quote.text}"</p>
                          <p className="text-xs text-slate-500 mt-1 font-bold">— {quote.author}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteQuote(idx)}
                          className="p-2 text-slate-600 hover:text-rose-500 hover:bg-slate-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Excluir Frase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
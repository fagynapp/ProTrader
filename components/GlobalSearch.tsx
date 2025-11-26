import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, TrendingUp, BookOpen, PieChart, 
  FileText, ArrowRight, Filter, Calculator 
} from 'lucide-react';
import { 
  MOCK_TRADES, 
  MOCK_STRATEGIES, 
  MOCK_INVESTMENTS, 
  MOCK_BROKERAGE_NOTES 
} from '../constants';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchCategory = 'ALL' | 'TRADES' | 'STRATEGIES' | 'INVESTMENTS' | 'NOTES';

interface SearchResult {
  id: string;
  type: 'TRADE' | 'STRATEGY' | 'INVESTMENT' | 'NOTE';
  title: string;
  subtitle: string;
  link: string;
  icon: React.ElementType;
  tags?: string[];
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('ALL');

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => document.getElementById('global-search-input')?.focus(), 100);
    } else {
      setQuery('');
      setCategory('ALL');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Search Logic
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Trades
    if (category === 'ALL' || category === 'TRADES') {
      MOCK_TRADES.forEach(trade => {
        if (
          trade.asset.toLowerCase().includes(lowerQuery) ||
          trade.strategy.toLowerCase().includes(lowerQuery) ||
          trade.status.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: `trade-${trade.id}`,
            type: 'TRADE',
            title: `${trade.asset} (${trade.type})`,
            subtitle: `${trade.date} • ${trade.strategy} • ${trade.pnl ? `R$ ${trade.pnl}` : 'Open'}`,
            link: '/trades',
            icon: TrendingUp,
            tags: [trade.status]
          });
        }
      });
    }

    // 2. Search Strategies
    if (category === 'ALL' || category === 'STRATEGIES') {
      MOCK_STRATEGIES.forEach(strat => {
        if (
          strat.name.toLowerCase().includes(lowerQuery) ||
          strat.description.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: `strat-${strat.id}`,
            type: 'STRATEGY',
            title: strat.name,
            subtitle: `${strat.winRate}% Winrate • ${strat.timeframes.join(', ')}`,
            link: '/strategies',
            icon: BookOpen
          });
        }
      });
    }

    // 3. Search Investments
    if (category === 'ALL' || category === 'INVESTMENTS') {
      MOCK_INVESTMENTS.forEach(inv => {
        if (
          inv.asset.toLowerCase().includes(lowerQuery) ||
          inv.type.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: `inv-${inv.id}`,
            type: 'INVESTMENT',
            title: inv.asset,
            subtitle: `${inv.type} • Qtd: ${inv.quantity} • Total: R$ ${inv.totalValue.toLocaleString()}`,
            link: '/investments',
            icon: PieChart,
            tags: [inv.type]
          });
        }
      });
    }

    // 4. Search Notes
    if (category === 'ALL' || category === 'NOTES') {
      MOCK_BROKERAGE_NOTES.forEach(note => {
        if (
          note.fileName.toLowerCase().includes(lowerQuery) ||
          note.date.includes(lowerQuery)
        ) {
          results.push({
            id: `note-${note.id}`,
            type: 'NOTE',
            title: `Nota de Corretagem: ${note.date}`,
            subtitle: `${note.fileName} • Liq: R$ ${note.netResult}`,
            link: '/finance',
            icon: FileText
          });
        }
      });
    }

    return results;
  }, [query, category]);

  const handleSelect = (link: string) => {
    navigate(link);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header / Input */}
        <div className="flex items-center p-4 border-b border-slate-800 bg-slate-900">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Busque por ativos, estratégias, datas ou notas..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <div className="flex items-center gap-2">
             {query && (
               <button onClick={() => setQuery('')} className="p-1 text-slate-500 hover:text-white">
                 <X className="w-4 h-4" />
               </button>
             )}
             <div className="hidden sm:flex px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 border border-slate-700">
               ESC
             </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center px-4 py-2 gap-2 border-b border-slate-800 bg-slate-900/50 overflow-x-auto custom-scrollbar">
           <Filter className="w-3 h-3 text-slate-500 mr-1" />
           {[
             { id: 'ALL', label: 'Tudo' },
             { id: 'TRADES', label: 'Trades' },
             { id: 'STRATEGIES', label: 'Estratégias' },
             { id: 'INVESTMENTS', label: 'Carteira' },
             { id: 'NOTES', label: 'Notas' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setCategory(tab.id as SearchCategory)}
               className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                 category === tab.id 
                   ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30' 
                   : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'
               }`}
             >
               {tab.label}
             </button>
           ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-slate-950/30 min-h-[300px]">
          {query.trim() === '' ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60 py-12">
               <Search className="w-12 h-12 mb-4 stroke-1" />
               <p className="text-sm">Digite para começar a buscar...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {filteredResults.length} resultados encontrados
              </p>
              {filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result.link)}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-slate-800 group transition-colors text-left border border-transparent hover:border-slate-700"
                >
                  <div className={`p-2 rounded-lg mr-4 ${
                    result.type === 'TRADE' ? 'bg-neon-green/10 text-neon-green' :
                    result.type === 'STRATEGY' ? 'bg-neon-cyan/10 text-neon-cyan' :
                    result.type === 'INVESTMENT' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    <result.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-slate-200 font-medium truncate group-hover:text-white">
                        {result.title}
                      </h4>
                      {result.tags?.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{result.subtitle}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
               <p className="text-sm">Nenhum resultado encontrado para "{query}".</p>
               <button onClick={() => setCategory('ALL')} className="mt-2 text-neon-cyan text-xs hover:underline">
                 Limpar filtros
               </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-500 flex justify-between items-center">
           <span>Use as setas para navegar (em breve)</span>
           <span className="flex items-center gap-1">ProTrade Search <Calculator className="w-3 h-3" /></span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;

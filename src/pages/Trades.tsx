
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_TRADES, generateDefaultJournal } from '../constants';
import { Trade, TradeStatus, TradeType, UserAccount } from '../types';
import TradeDetails from '../components/TradeDetails';
import UpgradeModal from '../components/UpgradeModal';
import { ChevronDown, ChevronUp, Pen, Trash2, Copy, Filter, Download, Image as ImageIcon, X, Search, RefreshCw, Lock } from 'lucide-react';

const Trades = () => {
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Check User Plan
  const userString = localStorage.getItem('protrader_user');
  const user: UserAccount = userString ? JSON.parse(userString) : {};
  const isBasic = user.plan === 'BASIC';

  // --- FILTER STATE ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterAsset, setFilterAsset] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | TradeType>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | TradeStatus>('ALL');

  // --- FILTER LOGIC ---
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      const matchAsset = trade.asset.toLowerCase().includes(filterAsset.toLowerCase());
      const matchType = filterType === 'ALL' || trade.type === filterType;
      const matchStatus = filterStatus === 'ALL' || trade.status === filterStatus;
      return matchAsset && matchType && matchStatus;
    });
  }, [trades, filterAsset, filterType, filterStatus]);

  const clearFilters = () => {
    setFilterAsset('');
    setFilterType('ALL');
    setFilterStatus('ALL');
  };

  const handleToggleFilter = () => {
    if (isBasic) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsFilterOpen(!isFilterOpen);
  };

  // --- EXPORT LOGIC ---
  const handleExport = () => {
    if (isBasic) {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (filteredTrades.length === 0) {
      alert("Não há dados para exportar com os filtros atuais.");
      return;
    }

    const headers = ['ID', 'Data', 'Ativo', 'Tipo', 'Status', 'Quantidade', 'Preço Entrada', 'Preço Saída', 'P&L (R$)', 'Estratégia'];
    
    const csvRows = [
      headers.join(';'), // Header row
      ...filteredTrades.map(t => {
        return [
          t.id,
          t.date,
          t.asset,
          t.type,
          t.status,
          t.quantity.toString().replace('.', ','),
          t.entryPrice.toString().replace('.', ','),
          (t.exitPrice || 0).toString().replace('.', ','),
          (t.pnl || 0).toString().replace('.', ','),
          `"${t.strategy}"` // Quote strategy to handle separators
        ].join(';');
      })
    ];

    const csvContent = "\uFEFF" + csvRows.join('\n'); // Add BOM for Excel compatibility
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `ProTrade_Export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACTIONS ---

  const toggleExpand = (tradeId: string) => {
    if (expandedTradeId === tradeId) {
      setExpandedTradeId(null);
    } else {
      setExpandedTradeId(tradeId);
    }
  };

  const handleNewTrade = () => {
    const newTrade: Trade = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      asset: 'NOVO ATIVO',
      type: TradeType.BUY,
      status: TradeStatus.OPEN,
      quantity: 1,
      entryPrice: 0,
      strategy: 'Em análise',
      journal: generateDefaultJournal()
    };
    
    setTrades(prev => [newTrade, ...prev]);
    setExpandedTradeId(newTrade.id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('Tem certeza que deseja excluir este trade?')) {
      setTrades(prev => prev.filter(t => t.id !== id));
      if (expandedTradeId === id) setExpandedTradeId(null);
    }
  };

  const handleDuplicate = (e: React.MouseEvent, trade: Trade) => {
    e.stopPropagation();
    const newTrade = { ...trade, id: Date.now().toString(), date: new Date().toISOString().split('T')[0], status: TradeStatus.OPEN };
    setTrades(prev => [newTrade, ...prev]);
  };

  const handleTradeUpdate = (updatedTrade: Trade) => {
    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
  };

  const handleViewImage = (e: React.MouseEvent, imageUrl?: string) => {
    e.stopPropagation();
    if (imageUrl) {
      setPreviewImage(imageUrl);
    }
  };

  return (
    <>
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName="Filtros e Exportação" 
      />

      <div className="flex flex-col space-y-6 min-h-screen">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Diário de Trades</h1>
            <p className="text-slate-400 text-sm">
              Mostrando {filteredTrades.length} de {trades.length} operações registradas.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={handleToggleFilter}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isFilterOpen || filterAsset || filterType !== 'ALL' || filterStatus !== 'ALL'
                  ? 'bg-slate-800 text-neon-cyan border-neon-cyan/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {isBasic ? <Lock className="w-3.5 h-3.5 text-yellow-500" /> : <Filter className="w-4 h-4" />}
              {isFilterOpen ? 'Ocultar Filtros' : 'Filtrar'}
            </button>
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
              title="Baixar CSV"
            >
              {isBasic ? <Lock className="w-3.5 h-3.5 text-yellow-500" /> : <Download className="w-4 h-4" />}
              Exportar
            </button>
            
            <button 
              onClick={handleNewTrade}
              className="px-4 py-2 bg-neon-green hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              <div className="w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center font-bold text-[10px] leading-none">+</div>
              Novo Trade
            </button>
          </div>
        </div>

        {/* Filter Panel (Expandable) */}
        {isFilterOpen && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <Filter className="w-4 h-4 text-neon-cyan" /> Filtros Avançados
               </h3>
               <button 
                 onClick={clearFilters}
                 className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
               >
                 <RefreshCw className="w-3 h-3" /> Limpar Filtros
               </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* Asset Search */}
               <div className="relative">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ativo</label>
                 <div className="relative">
                   <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                   <input 
                     type="text" 
                     placeholder="Buscar ativo..." 
                     className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-neon-cyan"
                     value={filterAsset}
                     onChange={(e) => setFilterAsset(e.target.value)}
                   />
                 </div>
               </div>

               {/* Type Filter */}
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tipo de Ordem</label>
                 <select 
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-cyan appearance-none"
                   value={filterType}
                   onChange={(e) => setFilterType(e.target.value as any)}
                 >
                   <option value="ALL">Todos os Tipos</option>
                   <option value={TradeType.BUY}>Compra (Long)</option>
                   <option value={TradeType.SELL}>Venda (Short)</option>
                 </select>
               </div>

               {/* Status Filter */}
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                 <select 
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-neon-cyan appearance-none"
                   value={filterStatus}
                   onChange={(e) => setFilterStatus(e.target.value as any)}
                 >
                   <option value="ALL">Todos os Status</option>
                   <option value={TradeStatus.OPEN}>Aberto</option>
                   <option value={TradeStatus.CLOSED}>Fechado</option>
                   <option value={TradeStatus.PENDING}>Pendente</option>
                 </select>
               </div>
               
               {/* Quick Stats Summary within Filter */}
               <div className="bg-slate-950 rounded-lg border border-slate-800 p-2 flex items-center justify-between px-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Filtrado</span>
                    <span className="text-lg font-bold text-white">{filteredTrades.length}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Resultado (R$)</span>
                    <span className={`text-sm font-bold ${filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0) >= 0 ? 'text-neon-green' : 'text-neon-rose'}`}>
                      {filteredTrades.reduce((acc, t) => acc + (t.pnl || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
               </div>
             </div>
          </div>
        )}

        {/* Trades Table */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 w-10"></th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Ativo</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Qtd</th>
                  <th className="p-4">Entrada</th>
                  <th className="p-4">Saída</th>
                  <th className="p-4">P&L</th>
                  <th className="p-4">Estratégia</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {filteredTrades.map((trade) => (
                  <React.Fragment key={trade.id}>
                    <tr 
                      onClick={() => toggleExpand(trade.id)}
                      className={`cursor-pointer transition-colors group ${
                        expandedTradeId === trade.id 
                          ? 'bg-slate-800/50 border-l-4 border-l-neon-green' 
                          : 'hover:bg-slate-800/30 border-l-4 border-l-transparent'
                      }`}
                    >
                      <td className="p-4 text-slate-500">
                        {expandedTradeId === trade.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          trade.status === TradeStatus.CLOSED 
                           ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                           : trade.status === TradeStatus.PENDING 
                             ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                             : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{trade.date}</td>
                      <td className="p-4 font-bold text-white tracking-wide">{trade.asset}</td>
                      <td className="p-4">
                        <span className={`font-bold ${trade.type === TradeType.BUY ? 'text-neon-green' : 'text-neon-rose'}`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{trade.quantity}</td>
                      <td className="p-4 font-mono text-slate-300">{trade.entryPrice.toLocaleString('pt-BR')}</td>
                      <td className="p-4 font-mono text-slate-300">{trade.exitPrice?.toLocaleString('pt-BR') || '-'}</td>
                      <td className="p-4">
                        {trade.pnl !== undefined ? (
                           <span className={`font-mono font-bold px-2 py-1 rounded ${
                             trade.pnl >= 0 ? 'text-neon-green bg-neon-green/5' : 'text-neon-rose bg-neon-rose/5'
                           }`}>
                             {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                           </span>
                        ) : (
                          <span className="text-slate-600">---</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300 max-w-[150px] truncate" title={trade.strategy}>{trade.strategy}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           {/* Image Shortcut Button */}
                           {trade.imageUrl && (
                             <button 
                               onClick={(e) => handleViewImage(e, trade.imageUrl)}
                               className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-neon-cyan transition-colors" 
                               title="Ver Gráfico/Imagem"
                             >
                                <ImageIcon className="w-4 h-4" />
                             </button>
                           )}
                           
                           {/* Edit - Green */}
                           <button 
                             className="p-1.5 rounded text-slate-300 hover:text-neon-green hover:bg-neon-green/10 transition-colors border border-transparent hover:border-neon-green/30" 
                             title="Expandir/Editar"
                           >
                              <Pen className="w-4 h-4" />
                           </button>
                           
                           {/* Duplicate - Yellow */}
                           <button 
                             onClick={(e) => handleDuplicate(e, trade)} 
                             className="p-1.5 rounded text-slate-300 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors border border-transparent hover:border-yellow-500/30" 
                             title="Duplicar"
                           >
                              <Copy className="w-4 h-4" />
                           </button>
                           
                           {/* Trash - Red */}
                           <button 
                             onClick={(e) => handleDelete(e, trade.id)} 
                             className="p-1.5 rounded text-slate-300 hover:text-neon-rose hover:bg-neon-rose/10 transition-colors border border-transparent hover:border-neon-rose/30" 
                             title="Excluir"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details Row - Fixed Full Width */}
                    {expandedTradeId === trade.id && (
                      <tr className="bg-slate-900/50">
                        <td colSpan={11} className="p-0 border-t border-slate-800 border-b border-slate-800 shadow-inner">
                           <div className="border-l-4 border-l-neon-green relative">
                             <TradeDetails trade={trade} onSave={handleTradeUpdate} />
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {filteredTrades.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                         <Filter className="w-8 h-8 opacity-20" />
                         <p>Nenhum trade encontrado com os filtros atuais.</p>
                         <button onClick={clearFilters} className="text-neon-cyan text-sm hover:underline">
                           Limpar filtros
                         </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Summary */}
          <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
             <span>* P&L calculado com base nos preços de saída registrados.</span>
             <div className="flex gap-4">
                <span>Total Visualizado: <strong>{filteredTrades.length}</strong></span>
             </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      {previewImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
            {/* Close Button */}
            <button 
              className="fixed top-6 right-6 z-[10000] text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-2 transition-all backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
            >
              <X className="w-8 h-8" />
            </button>

            <img 
              src={previewImage} 
              alt="Trade Preview" 
              className="w-full h-full object-contain select-none"
              onClick={(e) => e.stopPropagation()} 
            />
        </div>,
        document.body
      )}
    </>
  );
};

export default Trades;
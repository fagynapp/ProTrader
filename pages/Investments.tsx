
import React, { useState } from 'react';
import { MOCK_INVESTMENTS } from '../constants';
import { Investment } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  DollarSign, Briefcase, TrendingUp, Plus, Upload, 
  X, Save, FileSpreadsheet, CircleCheck, CircleAlert, Bitcoin 
} from 'lucide-react';

const Investments = () => {
  const COLORS = ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#F43F5E'];
  
  // State for Data
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
  
  // State for Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // State for Import
  const [importSource, setImportSource] = useState<'B3' | 'CRYPTO'>('B3');
  const [selectedExchange, setSelectedExchange] = useState('Binance');

  // State for Manual Form
  const [newAsset, setNewAsset] = useState({
    ticker: '',
    type: 'Ações',
    quantity: '',
    avgPrice: '',
    currentPrice: ''
  });

  // State for Import Simulation
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  // State for Currency View
  const [currencyView, setCurrencyView] = useState<'BRL' | 'USD'>('BRL');
  const MOCK_DOLLAR_RATE = 5.15;

  // --- Logic ---

  // Helper to format currency based on view
  const formatCurrency = (value: number) => {
    if (currencyView === 'USD') {
      return (value / MOCK_DOLLAR_RATE).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    
    const qty = parseFloat(newAsset.quantity);
    const avg = parseFloat(newAsset.avgPrice);
    const curr = parseFloat(newAsset.currentPrice) || avg; // Default to avg if empty
    
    const totalVal = qty * curr;
    const profit = avg > 0 ? ((curr - avg) / avg) * 100 : 0;

    const newItem: Investment = {
      id: Date.now().toString(),
      asset: newAsset.ticker.toUpperCase(),
      type: newAsset.type as any,
      quantity: qty,
      avgPrice: avg,
      currentPrice: curr,
      totalValue: totalVal,
      profitability: parseFloat(profit.toFixed(2))
    };

    setInvestments([...investments, newItem]);
    setIsManualModalOpen(false);
    setNewAsset({ ticker: '', type: 'Ações', quantity: '', avgPrice: '', currentPrice: '' });
  };

  const handleImportSimulation = () => {
    setImportStatus('uploading');
    setTimeout(() => {
      setImportStatus('success');
      
      let importedItem: Investment;
      
      if (importSource === 'CRYPTO') {
        importedItem = {
          id: Date.now().toString(),
          asset: 'ETH',
          type: 'Cripto',
          quantity: 1.5,
          avgPrice: 15000.00,
          currentPrice: 16200.00,
          totalValue: 24300,
          profitability: 8.00
        };
      } else {
        importedItem = {
          id: Date.now().toString(),
          asset: 'MXRF11',
          type: 'FIIs',
          quantity: 100,
          avgPrice: 10.15,
          currentPrice: 10.50,
          totalValue: 1050,
          profitability: 3.45
        };
      }

      setInvestments(prev => [...prev, importedItem]);
      
      setTimeout(() => {
        setImportStatus('idle');
        setIsImportModalOpen(false);
        // Reset default
        setImportSource('B3');
      }, 1500);
    }, 2000);
  };

  // Prepare data for Pie Chart based on current state
  const allocationData = investments.reduce((acc, curr) => {
    const found = acc.find(item => item.name === curr.type);
    if (found) {
      found.value += curr.totalValue;
    } else {
      acc.push({ name: curr.type, value: curr.totalValue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const totalEquity = investments.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="space-y-6 relative">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Carteira de Investimentos</h1>
          <p className="text-slate-400 text-sm">Gerencie seu portfólio de longo prazo</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Currency Toggle */}
          <button 
            onClick={() => setCurrencyView(prev => prev === 'BRL' ? 'USD' : 'BRL')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors font-bold text-sm ${currencyView === 'USD' ? 'bg-slate-800 text-neon-green border-neon-green/50' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}
            title="Alternar Moeda"
          >
            <DollarSign className="w-4 h-4" /> {currencyView}
          </button>

          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors font-medium"
          >
            <Upload className="w-4 h-4" /> Importar (B3/Cripto)
          </button>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center w-10 h-10 bg-neon-green hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors"
            title="Novo Ativo"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Summary Card */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 lg:col-span-1 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-slate-500 text-sm block mb-1">Patrimônio Total</span>
            <h2 className="text-4xl font-bold text-white font-mono">
              {formatCurrency(totalEquity)}
            </h2>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-neon-green/10 rounded-lg text-neon-green"><DollarSign className="w-5 h-5" /></div>
                   <div>
                     <p className="text-sm text-slate-400">Aportes (Mês)</p>
                     <p className="text-white font-bold">{formatCurrency(2500)}</p>
                   </div>
                </div>
             </div>
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-neon-cyan/10 rounded-lg text-neon-cyan"><Briefcase className="w-5 h-5" /></div>
                   <div>
                     <p className="text-sm text-slate-400">Ativos</p>
                     <p className="text-white font-bold">{investments.length} Posições</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Alocação por Classe</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm uppercase">
                <th className="p-4">Ativo</th>
                <th className="p-4">Classe</th>
                <th className="p-4 text-right">Qtd</th>
                <th className="p-4 text-right">Preço Médio</th>
                <th className="p-4 text-right">Preço Atual</th>
                <th className="p-4 text-right">Saldo Total</th>
                <th className="p-4 text-right">Rentabilidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {investments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-white">{item.asset}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">{item.type}</span>
                  </td>
                  <td className="p-4 text-right text-slate-300">{item.quantity}</td>
                  <td className="p-4 text-right text-slate-300 font-mono">{formatCurrency(item.avgPrice)}</td>
                  <td className="p-4 text-right text-white font-mono">{formatCurrency(item.currentPrice)}</td>
                  <td className="p-4 text-right text-white font-bold font-mono">
                    {formatCurrency(item.totalValue)}
                  </td>
                  <td className="p-4 text-right">
                     <span className={`flex items-center justify-end gap-1 ${item.profitability >= 0 ? 'text-neon-green' : 'text-neon-rose'}`}>
                       {item.profitability >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                       {item.profitability}%
                     </span>
                  </td>
                </tr>
              ))}
              {investments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhum ativo cadastrado. Adicione manualmente ou importe sua carteira.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL ADD MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
                 <h3 className="font-bold text-white flex items-center gap-2">
                   <Plus className="w-5 h-5 text-neon-cyan" /> Adicionar Ativo
                 </h3>
                 <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <form onSubmit={handleAddManual} className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código do Ativo (Ticker)</label>
                    <input 
                      type="text" required placeholder="Ex: PETR4" 
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none uppercase"
                      value={newAsset.ticker} onChange={(e) => setNewAsset({...newAsset, ticker: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Ativo</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none appearance-none"
                      value={newAsset.type} onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                    >
                      <option value="Ações">Ações</option>
                      <option value="FIIs">FIIs</option>
                      <option value="ETFs">ETFs</option>
                      <option value="Cripto">Cripto</option>
                      <option value="Renda Fixa">Renda Fixa</option>
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantidade</label>
                       <input 
                         type="number" step="0.01" required placeholder="0"
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                         value={newAsset.quantity} onChange={(e) => setNewAsset({...newAsset, quantity: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Médio</label>
                       <input 
                         type="number" step="0.01" required placeholder="0,00"
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                         value={newAsset.avgPrice} onChange={(e) => setNewAsset({...newAsset, avgPrice: e.target.value})}
                       />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço Atual (Opcional)</label>
                    <input 
                      type="number" step="0.01" placeholder="Se vazio, usa o preço médio"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                      value={newAsset.currentPrice} onChange={(e) => setNewAsset({...newAsset, currentPrice: e.target.value})}
                    />
                 </div>

                 <div className="pt-2">
                   <button type="submit" className="w-full py-3 bg-neon-cyan hover:bg-cyan-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                     <Save className="w-4 h-4" /> Salvar na Carteira
                   </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col">
              
              {/* Tabs */}
              <div className="flex border-b border-slate-800">
                  <button 
                      onClick={() => setImportSource('B3')}
                      className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${importSource === 'B3' ? 'border-purple-500 text-purple-500 bg-purple-500/5' : 'border-transparent text-slate-400 hover:text-white'}`}
                  >
                      <FileSpreadsheet className="w-4 h-4" /> B3 / Bolsa (CEI)
                  </button>
                  <button 
                       onClick={() => setImportSource('CRYPTO')}
                       className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${importSource === 'CRYPTO' ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-transparent text-slate-400 hover:text-white'}`}
                  >
                      <Bitcoin className="w-4 h-4" /> Corretoras Cripto
                  </button>
                  <button onClick={() => setIsImportModalOpen(false)} className="px-4 text-slate-500 hover:text-white">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="p-8 text-center">
                 {importStatus === 'idle' && (
                   <>
                    {importSource === 'B3' ? (
                      <div 
                        onClick={handleImportSimulation}
                        className="border-2 border-dashed border-slate-700 hover:border-purple-500 hover:bg-purple-500/5 rounded-xl p-10 cursor-pointer transition-all group"
                      >
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8" />
                          </div>
                          <h4 className="text-lg font-medium text-white mb-2">Importar do CEI (B3)</h4>
                          <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            Arraste o arquivo exportado da área do investidor (Excel/CSV) ou notas de corretagem.
                          </p>
                          <button className="mt-6 px-6 py-2 bg-slate-800 text-white text-sm font-bold rounded-lg border border-slate-700 group-hover:bg-slate-700">
                            Selecionar Arquivo
                          </button>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in">
                          <div className="text-left mb-4">
                             <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Selecione a Corretora</label>
                             <select 
                               className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                               value={selectedExchange} onChange={(e) => setSelectedExchange(e.target.value)}
                             >
                               <option value="Binance">Binance</option>
                               <option value="Bitget">Bitget</option>
                               <option value="Bybit">Bybit</option>
                               <option value="Coinbase">Coinbase</option>
                               <option value="Kraken">Kraken</option>
                               <option value="KuCoin">KuCoin</option>
                               <option value="Mercado Bitcoin">Mercado Bitcoin</option>
                             </select>
                          </div>

                          <div 
                            onClick={handleImportSimulation}
                            className="border-2 border-dashed border-slate-700 hover:border-orange-500 hover:bg-orange-500/5 rounded-xl p-8 cursor-pointer transition-all group"
                          >
                              <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-500 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6" />
                              </div>
                              <h4 className="text-base font-medium text-white mb-1">Histórico de Transações (.csv)</h4>
                              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                Exporte o histórico de "Trade History" ou "Transaction History" da {selectedExchange} e solte aqui.
                              </p>
                          </div>
                      </div>
                    )}
                   </>
                 )}

                 {importStatus === 'uploading' && (
                   <div className="py-10">
                      <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${importSource === 'B3' ? 'border-purple-500' : 'border-orange-500'}`}></div>
                      <h4 className="text-white font-medium">Processando arquivo...</h4>
                      <p className="text-sm text-slate-500 mt-2">Lendo ativos e calculando preço médio.</p>
                   </div>
                 )}

                 {importStatus === 'success' && (
                   <div className="py-10 animate-in zoom-in duration-300">
                      <div className="w-16 h-16 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-neon-green">
                         <CircleCheck className="w-8 h-8" />
                      </div>
                      <h4 className="text-white font-bold text-lg">Importação Concluída!</h4>
                      <p className="text-sm text-slate-500 mt-2">
                        {importSource === 'B3' ? 'Sua carteira de ações foi atualizada.' : 'Seus criptoativos foram adicionados.'}
                      </p>
                   </div>
                 )}
                 
                 {importStatus === 'idle' && (
                    <div className="mt-6 flex items-start gap-3 p-4 bg-slate-900 rounded-lg text-left border border-slate-800">
                       <CircleAlert className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                       <div className="text-xs text-slate-400">
                         <span className="font-bold text-slate-300">Nota:</span> A importação substitui o preço médio atual se o ativo já existir, recalculando com base no histórico importado.
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Investments;

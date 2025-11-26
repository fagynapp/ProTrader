import React, { useState } from 'react';
import { 
  Calculator, TrendingUp, TrendingDown, DollarSign, 
  Plus, Trash2, Target, Activity, Coins,
  Scale, RefreshCw
} from 'lucide-react';

const CalculatorPage = () => {
  const [activeTab, setActiveTab] = useState<'mini' | 'avg' | 'risk'>('mini');

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Calculator className="w-6 h-6 text-neon-green" />
          Calculadora do Trader
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('mini')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'mini'
              ? 'border-neon-cyan text-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" /> Minicontratos (B3)
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'risk'
              ? 'border-neon-green text-neon-green'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" /> Risco & Retorno (Ações/Cripto)
        </button>
        <button
          onClick={() => setActiveTab('avg')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'avg'
              ? 'border-purple-500 text-purple-500'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" /> Preço Médio
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'mini' && <MiniContractsCalculator />}
        {activeTab === 'risk' && <RiskRewardCalculator />}
        {activeTab === 'avg' && <AveragePriceCalculator />}
      </div>
    </div>
  );
};

// --- Sub-Component: Minicontratos (WIN/WDO) ---

const MiniContractsCalculator = () => {
  const [asset, setAsset] = useState<'WIN' | 'WDO'>('WIN');
  const [contracts, setContracts] = useState<number>(1);
  const [points, setPoints] = useState<number>(0);
  
  // Calculation Logic
  // WIN: R$ 0,20 per point per contract
  // WDO: R$ 10,00 per point per contract
  const multiplier = asset === 'WIN' ? 0.20 : 10.00;
  const financialResult = points * contracts * multiplier;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Inputs Panel */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Coins className="w-5 h-5 text-neon-cyan" /> Parâmetros da Operação
        </h2>

        <div className="space-y-6">
          {/* Asset Toggle */}
          <div>
             <label className="block text-sm font-medium text-slate-400 mb-2">Ativo</label>
             <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
               <button 
                 onClick={() => setAsset('WIN')}
                 className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${asset === 'WIN' ? 'bg-slate-800 text-neon-cyan shadow-sm' : 'text-slate-500 hover:text-white'}`}
               >
                 WIN (Índice)
               </button>
               <button 
                 onClick={() => setAsset('WDO')}
                 className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${asset === 'WDO' ? 'bg-slate-800 text-yellow-500 shadow-sm' : 'text-slate-500 hover:text-white'}`}
               >
                 WDO (Dólar)
               </button>
             </div>
          </div>

          {/* Contracts */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Quantidade de Contratos</label>
            <div className="relative">
              <input 
                type="number" 
                min="1"
                value={contracts}
                onChange={(e) => setContracts(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white font-mono focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Pontos (Gain ou Loss)</label>
            <div className="relative">
               <input 
                 type="number" 
                 value={points}
                 onChange={(e) => setPoints(Number(e.target.value))}
                 className={`w-full bg-slate-950 border rounded-lg py-3 px-4 font-mono focus:outline-none ${points >= 0 ? 'border-slate-700 text-neon-green focus:border-neon-green' : 'border-rose-900/50 text-rose-500 focus:border-rose-500'}`}
                 placeholder="Ex: 100 ou -100"
               />
               <span className="absolute right-4 top-3 text-xs text-slate-500">pts</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              * Use valores negativos para simular prejuízo (Stop Loss).
            </p>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center">
         <div className="text-center space-y-2 mb-8">
            <span className="text-slate-400 uppercase text-xs font-bold tracking-wider">Resultado Estimado</span>
            <div className={`text-5xl font-bold font-mono tracking-tight ${financialResult >= 0 ? 'text-neon-green' : 'text-neon-rose'}`}>
               {financialResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
         </div>

         <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Valor por Ponto (Total):</span>
              <span className="text-white font-mono">
                {((contracts * multiplier)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Multiplicador do Ativo:</span>
              <span className="text-white font-mono">R$ {multiplier.toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-800 my-2"></div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
              {asset === 'WIN' 
                ? 'No Mini-índice, cada ponto vale R$ 0,20 por contrato.' 
                : 'No Mini-dólar, cada ponto vale R$ 10,00 por contrato.'}
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Risk & Reward (Stocks/Crypto) ---

const RiskRewardCalculator = () => {
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');

  // Helper to parse float safely
  const safeParse = (val: string) => parseFloat(val) || 0;

  const entry = safeParse(entryPrice);
  const stop = safeParse(stopPrice);
  const target = safeParse(targetPrice);
  const qty = safeParse(quantity);

  // Calculations
  const riskPerShare = Math.abs(entry - stop);
  const rewardPerShare = Math.abs(target - entry);
  
  const totalRisk = riskPerShare * qty;
  const totalReward = rewardPerShare * qty;
  
  const riskPercent = entry > 0 ? ((stop - entry) / entry) * 100 : 0;
  const rewardPercent = entry > 0 ? ((target - entry) / entry) * 100 : 0;

  const ratio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '0.00';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="lg:col-span-1 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
             <Target className="w-5 h-5 text-neon-green" /> Dados do Trade
          </h2>
          
          <div className="space-y-4">
             <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Preço de Entrada</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                  <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green font-mono" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs text-neon-rose mb-1 uppercase font-bold">Stop Loss</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                    <input type="number" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-rose font-mono" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs text-neon-green mb-1 uppercase font-bold">Stop Gain (Alvo)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                    <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green font-mono" />
                  </div>
               </div>
             </div>

             <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase font-bold">Quantidade</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500 font-mono" placeholder="Ex: 100" />
             </div>
          </div>
       </div>

       <div className="lg:col-span-2 space-y-6">
          {/* Quick Ratio Card */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xl border border-slate-700">
                  1
                </div>
                <span className="text-slate-500 font-bold">PARA</span>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-slate-950 font-bold text-2xl border-4 ${parseFloat(ratio) >= 2 ? 'bg-neon-green border-emerald-900' : parseFloat(ratio) >= 1 ? 'bg-yellow-500 border-yellow-900' : 'bg-neon-rose border-rose-900'}`}>
                  {ratio}
                </div>
             </div>
             <div className="text-right">
                <span className="block text-slate-500 text-xs uppercase font-bold">Risco x Retorno (Ratio)</span>
                <span className="text-slate-300 text-sm">Para cada R$ 1,00 de risco, você busca R$ {ratio} de retorno.</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Risk Card */}
             <div className="bg-slate-900/50 border border-rose-900/30 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5">
                   <TrendingDown size={80} />
                </div>
                <h3 className="text-neon-rose font-bold mb-4 flex items-center gap-2"><TrendingDown className="w-5 h-5" /> Risco Estimado</h3>
                <div className="space-y-3 relative z-10">
                   <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Financeiro Total</span>
                      <span className="text-white font-mono font-bold text-lg">- {totalRisk.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Variação (%)</span>
                      <span className="text-neon-rose font-mono font-bold">{riskPercent.toFixed(2)}%</span>
                   </div>
                </div>
             </div>

             {/* Reward Card */}
             <div className="bg-slate-900/50 border border-emerald-900/30 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5">
                   <TrendingUp size={80} />
                </div>
                <h3 className="text-neon-green font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Retorno Potencial</h3>
                <div className="space-y-3 relative z-10">
                   <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Financeiro Total</span>
                      <span className="text-white font-mono font-bold text-lg text-neon-green">+ {totalReward.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Variação (%)</span>
                      <span className="text-neon-green font-mono font-bold">+{rewardPercent.toFixed(2)}%</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Sub-Component: Average Price (Preço Médio) ---

interface BuyEntry {
  id: string;
  price: string;
  quantity: string;
}

const AveragePriceCalculator = () => {
  const [entries, setEntries] = useState<BuyEntry[]>([
    { id: '1', price: '', quantity: '' },
    { id: '2', price: '', quantity: '' }
  ]);

  const addEntry = () => {
    setEntries([...entries, { id: Date.now().toString(), price: '', quantity: '' }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: string, field: 'price' | 'quantity', value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  // Calculation
  let totalQty = 0;
  let totalInvested = 0;

  entries.forEach(e => {
    const p = parseFloat(e.price) || 0;
    const q = parseFloat(e.quantity) || 0;
    totalQty += q;
    totalInvested += (p * q);
  });

  const averagePrice = totalQty > 0 ? totalInvested / totalQty : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
             <h3 className="font-bold text-white text-sm">Entradas / Aportes</h3>
             <button onClick={() => setEntries([{ id: '1', price: '', quantity: '' }])} className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
               <RefreshCw className="w-3 h-3" /> Limpar
             </button>
          </div>
          
          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
             {entries.map((entry, index) => (
               <div key={entry.id} className="flex items-center gap-3 animate-in fade-in duration-300">
                  <span className="w-6 text-center text-slate-600 font-mono text-xs font-bold">#{index + 1}</span>
                  <div className="flex-1 relative">
                     <span className="absolute left-3 top-2.5 text-slate-500 text-xs">R$</span>
                     <input 
                       type="number" 
                       placeholder="Preço"
                       value={entry.price} 
                       onChange={(e) => updateEntry(entry.id, 'price', e.target.value)} 
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-8 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 font-mono" 
                     />
                  </div>
                  <div className="w-32">
                     <input 
                       type="number" 
                       placeholder="Qtd"
                       value={entry.quantity} 
                       onChange={(e) => updateEntry(entry.id, 'quantity', e.target.value)} 
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-purple-500 font-mono" 
                     />
                  </div>
                  <button 
                    onClick={() => removeEntry(entry.id)}
                    className="p-2 text-slate-600 hover:text-rose-500 hover:bg-slate-800 rounded transition-colors"
                    disabled={entries.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
             ))}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
             <button 
               onClick={addEntry}
               className="w-full py-2 border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-medium"
             >
               <Plus className="w-4 h-4" /> Adicionar Nova Entrada
             </button>
          </div>
       </div>

       <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-500">
               <Scale size={120} />
             </div>
             <div className="relative z-10 text-center py-4">
               <p className="text-slate-400 text-sm uppercase font-bold tracking-widest mb-2">Preço Médio Final</p>
               <p className="text-4xl font-bold text-white font-mono mb-2">
                 {averagePrice > 0 ? averagePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
               </p>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold">
                  {entries.length} Entradas Computadas
               </div>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
             <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <span className="text-slate-400 text-sm">Quantidade Total</span>
                <span className="text-white font-mono font-bold">{totalQty}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Total Investido</span>
                <span className="text-white font-mono font-bold">
                   {totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
             </div>
          </div>
       </div>
    </div>
  );
};

export default CalculatorPage;
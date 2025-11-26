
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { KPI_STATS, MOCK_TRADES, MOCK_INVESTMENTS } from '../constants';
import { 
  Trophy, Target, TriangleAlert, Filter, TrendingUp, 
  Activity, BarChart2, Wallet, ArrowUpRight, Search, 
  ChevronDown, Check, Bitcoin, Building2, CandlestickChart, Layers, Lock, Crown
} from 'lucide-react';
import { UserAccount } from '../types';
import UpgradeModal from '../components/UpgradeModal';

const Dashboard = () => {
  const [selectedAsset, setSelectedAsset] = useState('Todos');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Check User Plan
  const userString = localStorage.getItem('protrader_user');
  const user: UserAccount = userString ? JSON.parse(userString) : {};
  const isBasic = user.plan === 'BASIC';

  // --- Helpers de Categorização ---
  
  const isMinicontract = (ticker: string) => /^(WIN|WDO|IND|DOL)/.test(ticker);
  const isCrypto = (ticker: string) => ['BTC', 'ETH', 'SOL', 'USDT', 'CRIPTO'].includes(ticker) || MOCK_INVESTMENTS.find(i => i.asset === ticker && i.type === 'Cripto');
  const isStock = (ticker: string) => !isMinicontract(ticker) && !isCrypto(ticker);

  const CATEGORIES = [
    { id: 'Todos', label: 'Visão Geral', icon: Layers, color: 'text-slate-400' },
    { id: 'Investimentos', label: 'Investimentos', icon: Wallet, color: 'text-purple-400' },
    { id: 'Trades', label: 'Trades (Geral)', icon: TrendingUp, color: 'text-neon-green' },
    { id: 'Minicontratos', label: 'Minicontratos', icon: CandlestickChart, color: 'text-yellow-500' },
    { id: 'Ações', label: 'Ações B3', icon: Building2, color: 'text-blue-400' },
    { id: 'Cripto', label: 'Criptomoedas', icon: Bitcoin, color: 'text-orange-500' },
  ];

  // Calculate available assets dynamically from both Trades and Investments
  const availableAssets = useMemo(() => {
    const tradeAssets = MOCK_TRADES.map(t => t.asset);
    const investAssets = MOCK_INVESTMENTS.map(i => i.asset);
    const uniqueAssets = Array.from(new Set([...tradeAssets, ...investAssets])).sort();
    return uniqueAssets;
  }, []);

  // Filter the list based on search query inside the dropdown
  const filteredAssets = useMemo(() => {
    return availableAssets.filter(asset => 
      asset.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableAssets, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAsset = (asset: string) => {
    setSelectedAsset(asset);
    setIsFilterOpen(false);
    setSearchQuery(''); // Reset search on select
  };

  // --- Dynamic Data Generators ---

  // 1. Filtered Stats Logic
  const currentStats = useMemo(() => {
    // Base Stats
    let baseStats = { ...KPI_STATS };

    // Simulation Logic based on Selection
    if (selectedAsset === 'Todos' || selectedAsset === 'Trades') return baseStats;

    if (selectedAsset === 'Investimentos') {
      const totalVal = MOCK_INVESTMENTS.reduce((acc, i) => acc + i.totalValue, 0);
      const totalCost = MOCK_INVESTMENTS.reduce((acc, i) => acc + (i.avgPrice * i.quantity), 0);
      const pnl = totalVal - totalCost;
      const profitability = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
      return { winRate: parseFloat(profitability.toFixed(2)), riskReturn: 0, totalTrades: MOCK_INVESTMENTS.length, totalPnL: pnl };
    }

    if (selectedAsset === 'Minicontratos') {
      return { winRate: 58.5, riskReturn: 1.8, totalTrades: 85, totalPnL: 4250.00 };
    }
    
    if (selectedAsset === 'Ações') {
      return { winRate: 72.0, riskReturn: 3.5, totalTrades: 12, totalPnL: 3100.50 };
    }

    if (selectedAsset === 'Cripto') {
      return { winRate: 60.0, riskReturn: 4.2, totalTrades: 25, totalPnL: 8900.00 };
    }

    // Individual Asset Filtering (Simulation)
    const seed = selectedAsset.length;
    return {
      winRate: Math.min(90, Math.max(30, KPI_STATS.winRate + (seed % 2 === 0 ? 5 : -5))),
      riskReturn: Math.max(0.5, KPI_STATS.riskReturn + (seed % 2 === 0 ? 0.5 : -0.2)),
      totalTrades: Math.floor(KPI_STATS.totalTrades / (seed + 1)) + 5,
      totalPnL: KPI_STATS.totalPnL * (seed % 2 === 0 ? 0.4 : 0.6)
    };
  }, [selectedAsset]);

  // 2. Monthly PnL Data
  const monthlyData = useMemo(() => {
    const baseData = [
      { month: 'Jan', gain: 4000, loss: -1200 },
      { month: 'Fev', gain: 3000, loss: -1500 },
      { month: 'Mar', gain: 5000, loss: -1000 },
      { month: 'Abr', gain: 2000, loss: -2800 },
      { month: 'Mai', gain: 4500, loss: -900 },
      { month: 'Jun', gain: 6000, loss: -1100 },
    ];

    if (selectedAsset === 'Todos' || selectedAsset === 'Trades') return baseData;
    
    // Custom Data Simulation
    if (selectedAsset === 'Investimentos' || selectedAsset === 'Ações') {
       return baseData.map(d => ({ month: d.month, gain: d.gain * 0.4, loss: 0 }));
    }
    if (selectedAsset === 'Cripto') {
       return baseData.map(d => ({ month: d.month, gain: d.gain * 1.5, loss: d.loss * 1.5 })); // Higher volatility
    }
    if (selectedAsset === 'Minicontratos') {
       return baseData.map(d => ({ month: d.month, gain: d.gain * 0.8, loss: d.loss * 0.9 }));
    }

    // Single Asset
    return baseData.map(d => ({
      month: d.month,
      gain: d.gain * (selectedAsset.length % 2 === 0 ? 0.3 : 0.5),
      loss: d.loss * 0.3
    }));
  }, [selectedAsset]);

  // 3. Buy/Sell Ratio or Asset Allocation
  const pieData = useMemo(() => {
    if (selectedAsset === 'Investimentos' || selectedAsset === 'Todos') {
        return [
            { name: 'Ações', value: 45, color: '#3B82F6' },
            { name: 'Minicontratos', value: 20, color: '#EAB308' },
            { name: 'FIIs', value: 20, color: '#06B6D4' },
            { name: 'Cripto', value: 15, color: '#F97316' },
        ];
    }
    if (selectedAsset === 'Ações') {
        return [
          { name: 'Swing Trade', value: 70, color: '#3B82F6' },
          { name: 'Buy & Hold', value: 30, color: '#10B981' },
        ];
    }
    if (selectedAsset === 'Minicontratos') {
      return [
        { name: 'WIN (Índice)', value: 60, color: '#10B981' },
        { name: 'WDO (Dólar)', value: 40, color: '#EAB308' },
      ];
    }
    return [
      { name: 'Compra (Long)', value: 65, color: '#10B981' },
      { name: 'Venda (Short)', value: 35, color: '#F43F5E' },
    ];
  }, [selectedAsset]);

  // 4. Equity Curve
  const equityData = useMemo(() => {
    const baseCurve = [
      { date: '01/05', balance: 10000 },
      { date: '05/05', balance: 10500 },
      { date: '10/05', balance: 10200 },
      { date: '15/05', balance: 11000 },
      { date: '20/05', balance: 11800 },
      { date: '25/05', balance: 11600 },
      { date: '30/05', balance: 12450 },
    ];
    
    if (['Investimentos', 'Ações', 'Cripto'].includes(selectedAsset)) {
        return baseCurve.map((p, i) => ({ date: p.date, balance: 10000 + (i * 800) })); // Growth
    }

    return baseCurve.map((p, i) => ({
      date: p.date,
      balance: (p.balance / 2) + (i * (selectedAsset === 'Minicontratos' ? 200 : 50))
    }));
  }, [selectedAsset]);

  // 5. Strategy Performance
  const strategyData = useMemo(() => {
    if (selectedAsset === 'Investimentos') return [
            { name: 'Buy & Hold', winRate: 100 },
            { name: 'Dividendos', winRate: 100 },
            { name: 'Swing Trade', winRate: 80 },
    ];
    if (selectedAsset === 'Minicontratos') return [
        { name: 'Scalping M1', winRate: 62 },
        { name: 'Pullback M5', winRate: 58 },
        { name: 'Vwap', winRate: 45 },
    ];
    if (selectedAsset === 'Cripto') return [
        { name: 'HODL', winRate: 90 },
        { name: 'Momentum', winRate: 65 },
        { name: 'Rompimento', winRate: 40 },
    ];
    
    return [
        { name: 'Pullback', winRate: 75 },
        { name: 'Rompimento', winRate: 45 },
        { name: 'Reversão', winRate: 60 },
    ];
  }, [selectedAsset]);

  const getHeaderIcon = () => {
    const category = CATEGORIES.find(c => c.id === selectedAsset);
    if (category) return <category.icon className={`w-4 h-4 ${category.color}`} />;
    return <Activity className="w-4 h-4 text-neon-cyan" />;
  };

  return (
    <div className="space-y-6 relative">
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName="Analytics Avançado" 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold text-white">Painel Analítico</h1>
        
        {/* Custom Filter Search Dropdown */}
        <div className="relative w-full md:w-72 z-30" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-neon-cyan/50 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg group"
          >
            <div className="flex items-center gap-3">
               <div className="p-1.5 bg-slate-800 rounded-lg border border-slate-700 group-hover:border-neon-cyan/30 transition-colors">
                  {getHeaderIcon()}
               </div>
               <span className="font-medium text-sm truncate">{selectedAsset}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top flex flex-col max-h-[500px]">
              
              {/* Search Input */}
              <div className="p-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-20">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Filtrar ativo..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-neon-cyan placeholder-slate-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1">
                {/* Category Section (Only show if not searching or query matches) */}
                {!searchQuery && (
                  <div className="p-2 grid grid-cols-2 gap-2 border-b border-slate-800/50">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectAsset(cat.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-colors ${
                          selectedAsset === cat.id 
                          ? 'bg-slate-800 border border-slate-700 text-white' 
                          : 'hover:bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
                        }`}
                      >
                         <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                         {cat.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Asset List Section */}
                <div className="p-2 space-y-1">
                  <p className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {searchQuery ? 'Resultados da Busca' : 'Todos os Ativos'}
                  </p>
                  
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => {
                      const isSelected = selectedAsset === asset;
                      let Icon = Activity;
                      let color = "text-slate-400";

                      if (isMinicontract(asset)) { Icon = CandlestickChart; color = "text-yellow-500"; }
                      else if (isCrypto(asset)) { Icon = Bitcoin; color = "text-orange-500"; }
                      else if (isStock(asset)) { Icon = Building2; color = "text-blue-400"; }

                      return (
                        <button
                          key={asset}
                          onClick={() => handleSelectAsset(asset)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all group ${
                            isSelected 
                              ? 'bg-neon-cyan/10 text-neon-cyan' 
                              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={isSelected ? 'text-neon-cyan' : color}>
                               <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-medium">{asset}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-neon-cyan" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-4 text-center text-slate-500 text-sm">
                      Nenhum ativo encontrado.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Row (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
           <div className="flex justify-between items-start mb-2">
             <span className="text-slate-500 text-xs uppercase font-bold">
               {selectedAsset === 'Investimentos' ? 'Rentabilidade' : 'Winrate'}
             </span>
             <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-neon-green transition-colors" />
           </div>
           <span className="text-2xl font-bold text-neon-green">{currentStats.winRate.toFixed(1)}%</span>
           {selectedAsset !== 'Todos' && <span className="text-[10px] text-slate-500 absolute bottom-2 right-2">Filtro: {selectedAsset}</span>}
        </div>
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-slate-500 text-xs uppercase font-bold">
                {selectedAsset === 'Investimentos' ? 'Patrimônio' : 'Média Gain'}
             </span>
             <ArrowUpRight className="w-4 h-4 text-slate-600" />
           </div>
           <span className="text-2xl font-bold text-neon-green font-mono">
             {selectedAsset === 'Investimentos' 
                ? (45000).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
                : (450 * (currentStats.winRate / 65)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
             }
           </span>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-slate-500 text-xs uppercase font-bold">
                {selectedAsset === 'Investimentos' ? 'Yield (DY)' : 'Média Loss'}
             </span>
             <Activity className="w-4 h-4 text-slate-600" />
           </div>
           <span className={`text-2xl font-bold font-mono ${selectedAsset === 'Investimentos' ? 'text-neon-cyan' : 'text-neon-rose'}`}>
             {selectedAsset === 'Investimentos' ? '0.85% a.m.' : 'R$ -180,00'}
           </span>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
           <div className="flex justify-between items-start mb-2">
             <span className="text-slate-500 text-xs uppercase font-bold">
               {selectedAsset === 'Investimentos' ? 'Qtd. Ativos' : 'Melhor Setup'}
             </span>
             <Trophy className="w-4 h-4 text-yellow-500" />
           </div>
           <span className="text-lg font-bold text-white truncate">
             {selectedAsset === 'Investimentos' ? `${currentStats.totalTrades} Posições` : strategyData[0].name}
           </span>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800">
           <div className="flex justify-between items-start mb-2">
             <span className="text-slate-500 text-xs uppercase font-bold">Resultado Total</span>
             <Wallet className="w-4 h-4 text-neon-cyan" />
           </div>
           <span className={`text-2xl font-bold ${currentStats.totalPnL >= 0 ? 'text-neon-cyan' : 'text-neon-rose'}`}>
             {currentStats.totalPnL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
           </span>
        </div>
      </div>

      {/* CHARTS CONTAINER - BLOCKED IF BASIC */}
      <div className="relative">
        {isBasic && (
            <div className="absolute inset-0 z-20 backdrop-blur-sm bg-slate-950/70 flex items-center justify-center rounded-xl border border-slate-800">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-slate-800">
                        <Lock className="w-8 h-8 text-slate-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Análise Avançada Bloqueada</h2>
                    <p className="text-slate-400 mb-6 text-sm">
                        Gráficos de evolução patrimonial, performance mensal e análise de estratégias são exclusivos do plano Premium.
                    </p>
                    <button 
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="px-6 py-2.5 bg-neon-cyan hover:bg-cyan-600 text-slate-900 font-bold rounded-lg transition-all shadow-lg shadow-neon-cyan/20 flex items-center justify-center gap-2 mx-auto"
                    >
                        <Crown className="w-4 h-4 fill-slate-900" /> Desbloquear Gráficos
                    </button>
                </div>
            </div>
        )}

        <div className={`space-y-6 ${isBasic ? 'opacity-20 pointer-events-none filter blur-sm select-none' : ''}`}>
            {/* Main Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Equity Curve */}
                <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" /> Evolução Patrimonial ({selectedAsset})
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={equityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val/1000}k`} />
                        <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        itemStyle={{ color: '#10B981' }}
                        formatter={(val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        />
                        <Line type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={3} dot={{fill: '#10B981', strokeWidth: 0}} activeDot={{r: 6}} animationDuration={1000} />
                    </LineChart>
                    </ResponsiveContainer>
                </div>
                </div>

                {/* Buy vs Sell Ratio */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-neon-cyan" /> 
                    {selectedAsset === 'Investimentos' ? 'Alocação' : 'Direção / Alocação'}
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                        <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>

            {/* Main Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Monthly P&L */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-white font-semibold mb-4">
                    {selectedAsset === 'Investimentos' ? 'Dividendos Recebidos' : 'Performance Mensal (Gross)'}
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                        cursor={{fill: '#1e293b'}}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                        />
                        <Bar dataKey="gain" fill="#10B981" radius={[4, 4, 0, 0]} name={selectedAsset === 'Investimentos' ? 'Proventos' : 'Gain'} animationDuration={1000} />
                        <Bar dataKey="loss" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Loss" animationDuration={1000} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>

                {/* Strategy Performance */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-white font-semibold mb-4">
                    {selectedAsset === 'Investimentos' ? 'Rentabilidade por Estratégia' : 'Assertividade por Estratégia (%)'}
                </h3>
                <div className="space-y-6 mt-8">
                    {strategyData.map((strat, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-300">{strat.name}</span>
                        <span className={`text-sm font-bold ${strat.winRate > 50 ? 'text-neon-green' : 'text-orange-400'}`}>{strat.winRate}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-1000 ${strat.winRate > 60 ? 'bg-neon-green' : strat.winRate > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${strat.winRate}%` }}>
                        </div>
                        </div>
                    </div>
                    ))}
                    
                    {/* Conditional Hint */}
                    {selectedAsset !== 'Investimentos' && strategyData.some(s => s.winRate < 50) && (
                    <div className="p-3 mt-4 bg-slate-800/50 rounded-lg flex items-start gap-3 animate-in fade-in">
                        <TriangleAlert className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <p className="text-xs text-slate-400">
                        Dica: A estratégia "{strategyData.find(s => s.winRate < 50)?.name}" está performando abaixo de 50% em {selectedAsset}. Considere revisar os stops.
                        </p>
                    </div>
                    )}
                </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
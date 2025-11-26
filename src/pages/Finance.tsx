import React, { useState, useMemo } from 'react';
import { Upload, FileText, Download, Calendar, Calculator, TriangleAlert, CircleCheck, CircleX, TrendingDown, Search, Plus, Trash2, Save, ArrowRight, FileSpreadsheet, Bitcoin, Building2, Wallet, RefreshCw, Hash, DollarSign, TrendingUp } from 'lucide-react';
import { MOCK_BROKERAGE_NOTES, MOCK_TAX_RECORDS } from '../constants';

// --- TYPES FOR IMPORT MODULE ---
type ImportMode = 'B3' | 'CRYPTO';
type CryptoExchange = 'Binance' | 'Bybit' | 'Bitget';

// --- PADRÃO SINACOR (B3) OBRIGATÓRIO ---
interface SinacorRow {
  id: string;
  date: string;          // Data do Pregão
  noteNumber: string;    // Número da Nota
  brokerName: string;    // Corretora
  brokerCNPJ: string;    // CNPJ Corretora
  businessType: string;  // Tipo de Negócio (Normal/DayTrade)
  cv: 'C' | 'V';         // Compra/Venda
  asset: string;         // Especificação do Título
  maturity: string;      // Vencimento (se houver)
  qty: number;           // Quantidade
  price: number;         // Preço / Ajuste
  operationValue: number;// Valor Operação / Ajuste
  dc: 'D' | 'C';         // Débito / Crédito
  
  // Taxas e Custos
  opFee: number;         // Taxa Operacional
  b3Fee: number;         // Taxa de Registro / Emolumentos
  irrf: number;          // I.R.R.F. (dedo-duro)
  iss: number;           // ISS
  
  // Totais
  positionAdjustment: number; // Ajuste de Posição (Futuros)
  totalExpenses: number;      // Total de Despesas
  netTotal: number;           // Líquido da Nota
  
  obs: string;
}

// --- MODELOS CRIPTO ---
interface CryptoRow {
  id: string;
  date: string;
  pair: string;
  opType: 'BUY' | 'SELL';
  
  // Campos específicos por corretora
  orderType?: string; // Binance, Bybit
  position?: string;  // Bybit (Long/Short)
  category?: string;  // Bitget (Spot/Futures)
  
  qty: number;
  price: number;
  total: number;
  fee: number;
  feeCoin: string;
  
  pnl?: number;      // Realized PnL
  tradeId: string;
  obs: string;
}

const Finance = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'tax' | 'reports'>('notes');

  // --- IMPORT STATE ---
  const [importMode, setImportMode] = useState<ImportMode>('B3');
  const [selectedExchange, setSelectedExchange] = useState<CryptoExchange>('Binance');
  const [importStage, setImportStage] = useState<'UPLOAD' | 'PREVIEW'>('UPLOAD');
  const [isProcessing, setIsProcessing] = useState(false);

  // Data States
  const [sinacorRows, setSinacorRows] = useState<SinacorRow[]>([]);
  const [cryptoRows, setCryptoRows] = useState<CryptoRow[]>([]);

  // Helper to check if user has a pending DARF
  const pendingDarf = MOCK_TAX_RECORDS.find(r => r.status === 'PENDING');

  // --- CALCULATED SUMMARY FOR B3 NOTES ---
  const b3Summary = useMemo(() => {
    if (sinacorRows.length === 0) return null;

    const first = sinacorRows[0];
    const count = sinacorRows.length;

    // Calculate Gross PnL (Sum of operations before taxes)
    // If D/C is 'C' it adds, if 'D' it subtracts.
    const grossPnl = sinacorRows.reduce((acc, row) => {
      return row.dc === 'C' ? acc + row.operationValue : acc - row.operationValue;
    }, 0);

    return {
      grossPnl,
      totalExpenses: first.totalExpenses,
      irrf: first.irrf,
      netTotal: first.netTotal,
      count,
      noteNumber: first.noteNumber,
      date: first.date,
      broker: first.brokerName
    };
  }, [sinacorRows]);

  // --- IMPORT HANDLERS ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // SIMULAÇÃO DE LEITURA (MOCK)
    setTimeout(() => {
      if (importMode === 'B3') {
        // Mock baseado exatamente no PDF/OCR fornecido:
        // Nota 660930 - Genial Investimentos - 05/11/2025
        const mockSinacor: SinacorRow[] = [
          {
            id: '1', 
            date: '05/11/2025', 
            noteNumber: '660930', 
            brokerName: 'GENIAL CCTVM S/A', 
            brokerCNPJ: '27.652.684/0001-62',
            businessType: 'DAY TRADE', 
            cv: 'V',
            asset: 'WIN Z25', 
            maturity: '17/12/2025', 
            qty: 2, 
            price: 154195.0000, 
            operationValue: 634.40,
            dc: 'D',
            opFee: 0, 
            b3Fee: 2.00, // Taxa registro BM&F (1.28) + Taxas BM&F (0.72) = 2.00
            irrf: 0, 
            iss: 0,
            positionAdjustment: 0, // Ajuste de posição 0,00 C
            totalExpenses: 2.00,
            netTotal: -30.00, // 30,00 D
            obs: 'Nota 660930 - Linha 1'
          },
          {
            id: '2', 
            date: '05/11/2025', 
            noteNumber: '660930', 
            brokerName: 'GENIAL CCTVM S/A', 
            brokerCNPJ: '27.652.684/0001-62',
            businessType: 'DAY TRADE', 
            cv: 'V',
            asset: 'WIN Z25', 
            maturity: '17/12/2025', 
            qty: 2, 
            price: 155155.0000, 
            operationValue: 250.40,
            dc: 'D',
            opFee: 0, 
            b3Fee: 2.00, 
            irrf: 0, 
            iss: 0,
            positionAdjustment: 0,
            totalExpenses: 2.00,
            netTotal: -30.00, 
            obs: 'Nota 660930 - Linha 2'
          },
          {
            id: '3', 
            date: '05/11/2025', 
            noteNumber: '660930', 
            brokerName: 'GENIAL CCTVM S/A', 
            brokerCNPJ: '27.652.684/0001-62',
            businessType: 'DAY TRADE', 
            cv: 'C',
            asset: 'WIN Z25', 
            maturity: '17/12/2025', 
            qty: 2, 
            price: 155155.0000, 
            operationValue: 250.40,
            dc: 'C',
            opFee: 0, 
            b3Fee: 2.00, 
            irrf: 0, 
            iss: 0,
            positionAdjustment: 0,
            totalExpenses: 2.00,
            netTotal: -30.00, 
            obs: 'Nota 660930 - Linha 3'
          },
          {
            id: '4', 
            date: '05/11/2025', 
            noteNumber: '660930', 
            brokerName: 'GENIAL CCTVM S/A', 
            brokerCNPJ: '27.652.684/0001-62',
            businessType: 'DAY TRADE', 
            cv: 'C',
            asset: 'WIN Z25', 
            maturity: '17/12/2025', 
            qty: 2, 
            price: 154265.0000, 
            operationValue: 606.40,
            dc: 'C',
            opFee: 0, 
            b3Fee: 2.00, 
            irrf: 0, 
            iss: 0,
            positionAdjustment: 0,
            totalExpenses: 2.00,
            netTotal: -30.00, 
            obs: 'Nota 660930 - Linha 4'
          }
        ];
        setSinacorRows(mockSinacor);
      } else {
        // MOCK CRIPTO BASEADO NA CORRETORA
        let mockCrypto: CryptoRow[] = [];

        if (selectedExchange === 'Binance') {
             mockCrypto = [
                { id: '1', date: '2025-05-12 14:30', pair: 'BTCUSDT', opType: 'BUY', orderType: 'Limit', qty: 0.005, price: 62000, total: 310, fee: 0.31, feeCoin: 'USDT', pnl: 0, tradeId: '88293102', obs: '' }
             ];
        } else if (selectedExchange === 'Bybit') {
             mockCrypto = [
                { id: '1', date: '2025-05-12 18:45', pair: 'ETHUSDT', opType: 'SELL', position: 'Short', orderType: 'Market', qty: 1.5, price: 3100, total: 4650, fee: 2.30, feeCoin: 'USDT', pnl: 120.50, tradeId: '99123123', obs: 'Lucro Swing' }
             ];
        } else { // Bitget
             mockCrypto = [
                { id: '1', date: '2025-05-13 09:00', pair: 'SOLUSDT', opType: 'BUY', category: 'Futures', qty: 10, price: 145.50, total: 1455, fee: 1.45, feeCoin: 'USDT', pnl: 0, tradeId: '77213', obs: '' }
             ];
        }
        
        setCryptoRows(mockCrypto);
      }
      
      setIsProcessing(false);
      setImportStage('PREVIEW');
    }, 1500);
  };

  const handleSaveImport = () => {
    alert("Dados validados e salvos no sistema financeiro com sucesso!");
    setImportStage('UPLOAD');
    setSinacorRows([]);
    setCryptoRows([]);
  };

  // --- GENERIC TABLE EDIT HANDLERS ---
  const updateRow = (id: string, field: string, value: any, isSinacor: boolean) => {
    if (isSinacor) {
      setSinacorRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    } else {
      setCryptoRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    }
  };

  const deleteRow = (id: string, isSinacor: boolean) => {
    if (!window.confirm("Remover esta linha?")) return;
    if (isSinacor) setSinacorRows(prev => prev.filter(r => r.id !== id));
    else setCryptoRows(prev => prev.filter(r => r.id !== id));
  };

  const addRow = (isSinacor: boolean) => {
    if (isSinacor) {
      const newRow: SinacorRow = {
        id: Date.now().toString(), date: '', noteNumber: '', brokerName: '', brokerCNPJ: '', businessType: 'NORMAL', 
        cv: 'C', asset: '', maturity: '', qty: 0, price: 0, operationValue: 0, dc: 'D', 
        opFee: 0, b3Fee: 0, irrf: 0, iss: 0, positionAdjustment: 0, totalExpenses: 0, netTotal: 0, obs: ''
      };
      setSinacorRows([...sinacorRows, newRow]);
    } else {
      const newRow: CryptoRow = {
        id: Date.now().toString(), date: '', pair: '', opType: 'BUY', qty: 0, price: 0, total: 0, fee: 0, feeCoin: 'USDT', tradeId: '', obs: ''
      };
      setCryptoRows([...cryptoRows, newRow]);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-white">Financeiro & Fiscal</h1>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'notes'
              ? 'border-neon-green text-neon-green'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Notas de Corretagem
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tax'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Imposto de Renda (IR)
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-neon-cyan text-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Relatórios Gerenciais
        </button>
      </div>

      {/* Content: Brokerage Notes (Import Module) */}
      {activeTab === 'notes' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* SUMMARY BLOCK FOR B3 NOTES (TOP OF PAGE) */}
          {importMode === 'B3' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
               <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4 relative z-10">
                  <FileText className="w-5 h-5 text-neon-cyan" />
                  <h2 className="text-lg font-bold text-white">Resumo da Nota de Corretagem</h2>
               </div>

               {!b3Summary ? (
                  <div className="text-center py-8 text-slate-500 relative z-10">
                     <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                     <p className="font-medium">Nenhuma nota importada ainda.</p>
                     <p className="text-xs mt-1">Importe um arquivo abaixo para ver o resumo.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                     {/* Lucro/Prejuízo do Dia */}
                     <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs text-slate-500 uppercase font-bold">Lucro / Prejuízo (Bruto)</span>
                           <TrendingUp className={`w-4 h-4 ${b3Summary.grossPnl >= 0 ? 'text-neon-green' : 'text-rose-500'}`} />
                        </div>
                        <span className={`text-xl font-bold font-mono ${b3Summary.grossPnl >= 0 ? 'text-neon-green' : 'text-rose-500'}`}>
                           {b3Summary.grossPnl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                     </div>

                     {/* Total Despesas */}
                     <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs text-slate-500 uppercase font-bold">Total Despesas</span>
                           <DollarSign className="w-4 h-4 text-rose-400" />
                        </div>
                        <span className="text-xl font-bold font-mono text-rose-400">
                           - {b3Summary.totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                     </div>

                     {/* IRRF */}
                     <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs text-slate-500 uppercase font-bold">IRRF (Retido)</span>
                           <TriangleAlert className="w-4 h-4 text-yellow-500" />
                        </div>
                        <span className="text-xl font-bold font-mono text-yellow-500">
                           - {b3Summary.irrf.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                     </div>

                     {/* Total Líquido */}
                     <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
                        <div className={`absolute inset-0 opacity-10 ${b3Summary.netTotal >= 0 ? 'bg-neon-green' : 'bg-rose-500'}`}></div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                           <span className="text-xs text-slate-400 uppercase font-bold">Total Líquido da Nota</span>
                           <Wallet className={`w-4 h-4 ${b3Summary.netTotal >= 0 ? 'text-neon-green' : 'text-rose-500'}`} />
                        </div>
                        <span className={`text-2xl font-bold font-mono relative z-10 ${b3Summary.netTotal >= 0 ? 'text-neon-green' : 'text-rose-500'}`}>
                           {b3Summary.netTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                     </div>

                     {/* Row 2: Metadata */}
                     <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                        <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Qtd. Operações</span>
                        <span className="text-lg font-bold text-white">{b3Summary.count}</span>
                     </div>
                     
                     <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                           <Hash className="w-3 h-3 text-slate-500" />
                           <span className="text-xs text-slate-500 uppercase font-bold">Número da Nota</span>
                        </div>
                        <span className="text-lg font-bold text-white">{b3Summary.noteNumber || '---'}</span>
                     </div>

                     <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                           <Calendar className="w-3 h-3 text-slate-500" />
                           <span className="text-xs text-slate-500 uppercase font-bold">Data do Pregão</span>
                        </div>
                        <span className="text-lg font-bold text-white">{b3Summary.date || '---'}</span>
                     </div>

                     <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                           <Building2 className="w-3 h-3 text-slate-500" />
                           <span className="text-xs text-slate-500 uppercase font-bold">Corretora</span>
                        </div>
                        <span className="text-lg font-bold text-white truncate" title={b3Summary.broker}>{b3Summary.broker || '---'}</span>
                     </div>
                  </div>
               )}
            </div>
          )}
          
          {/* IMPORT MODULE CONTAINER */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             {/* Module Header */}
             <div className="p-6 border-b border-slate-800 bg-slate-950/30">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-neon-cyan" /> Importar Notas de Corretagem
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                   Importação oficial seguindo o padrão B3 (SINACOR) e extratos de corretoras Cripto.
                </p>
             </div>

             {/* Import Tabs (B3 vs Crypto) */}
             <div className="flex border-b border-slate-800">
                <button 
                  onClick={() => { setImportMode('B3'); setImportStage('UPLOAD'); }}
                  className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${importMode === 'B3' ? 'bg-slate-800 text-white border-b-2 border-neon-green' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                   <Building2 className="w-4 h-4" /> B3 (Padrão SINACOR)
                </button>
                <button 
                  onClick={() => { setImportMode('CRYPTO'); setImportStage('UPLOAD'); }}
                  className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${importMode === 'CRYPTO' ? 'bg-slate-800 text-white border-b-2 border-orange-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                >
                   <Bitcoin className="w-4 h-4" /> Importar Cripto
                </button>
             </div>
             
             {/* STAGE 1: UPLOAD AREA */}
             {importStage === 'UPLOAD' && (
               <div className="p-8">
                  {importMode === 'CRYPTO' && (
                     <div className="max-w-md mx-auto mb-8">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-center">Selecione a Corretora</label>
                        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                           {(['Binance', 'Bybit', 'Bitget'] as CryptoExchange[]).map(ex => (
                             <button
                               key={ex}
                               onClick={() => setSelectedExchange(ex)}
                               className={`py-2 rounded text-sm font-bold transition-all ${selectedExchange === ex ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                             >
                               {ex}
                             </button>
                           ))}
                        </div>
                     </div>
                  )}

                  <div 
                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all group cursor-pointer relative overflow-hidden ${isProcessing ? 'border-neon-cyan bg-slate-900' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/30'}`}
                  >
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isProcessing} accept=".pdf,.csv,.xlsx,.xls" />
                    
                    {isProcessing ? (
                       <div className="py-8">
                          <div className="w-10 h-10 border-4 border-slate-800 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-white font-bold">Analisando arquivo...</p>
                          <p className="text-xs text-slate-500 mt-2">
                             {importMode === 'B3' ? 'Identificando campos SINACOR...' : 'Lendo histórico da corretora...'}
                          </p>
                       </div>
                    ) : (
                       <>
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${importMode === 'B3' ? 'bg-slate-800 text-neon-green' : 'bg-slate-800 text-orange-500'}`}>
                             <Upload className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-bold text-white">
                            {importMode === 'B3' ? 'Nota de Corretagem (PDF/Excel)' : `Histórico da ${selectedExchange}`}
                          </h3>
                          <p className="text-slate-400 text-sm mt-2 mb-6 max-w-md">
                             {importMode === 'B3' 
                               ? 'O sistema reconhece automaticamente o layout oficial da B3 (SINACOR).' 
                               : 'Envie o arquivo CSV/Excel exportado diretamente da exchange.'}
                          </p>
                          <button className="px-6 py-2.5 bg-slate-800 text-white rounded-lg text-sm border border-slate-700 font-medium pointer-events-none">
                             Selecionar Arquivo
                          </button>
                       </>
                    )}
                  </div>
               </div>
             )}

             {/* STAGE 2: PREVIEW & EDIT TABLE */}
             {importStage === 'PREVIEW' && (
                <div className="flex flex-col h-full">
                   {/* Toolbar */}
                   <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center gap-4 sticky top-0 z-20">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${importMode === 'B3' ? 'bg-neon-green' : 'bg-orange-500'}`}></div>
                         <span className="text-sm font-bold text-white">
                           Conferência: {importMode === 'B3' ? 'Padrão SINACOR' : selectedExchange}
                         </span>
                         <span className="text-xs text-slate-500 border-l border-slate-700 pl-2 ml-2">
                           {importMode === 'B3' ? sinacorRows.length : cryptoRows.length} registros
                         </span>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => setImportStage('UPLOAD')} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white">
                            Cancelar
                         </button>
                         <button onClick={() => addRow(importMode === 'B3')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg border border-slate-700 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Linha
                         </button>
                         <button onClick={handleSaveImport} className="px-6 py-2 bg-neon-green hover:bg-emerald-600 text-slate-950 text-sm font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-neon-green/10">
                            <Save className="w-4 h-4" /> Salvar no Sistema
                         </button>
                      </div>
                   </div>

                   {/* TABLE AREA */}
                   <div className="overflow-x-auto max-h-[600px] custom-scrollbar p-4 bg-slate-950">
                      
                      {/* SINACOR TABLE (B3) - STRICT LAYOUT */}
                      {importMode === 'B3' && (
                        <table className="w-full text-left border-collapse min-w-[2400px]">
                           <thead>
                              <tr className="text-xs uppercase font-bold text-slate-500 bg-slate-900 border-b border-slate-800">
                                 <th className="p-3 sticky left-0 bg-slate-900 z-10 w-10">#</th>
                                 <th className="p-3 min-w-[120px]">Data Pregão</th>
                                 <th className="p-3 min-w-[100px]">Nº Nota</th>
                                 <th className="p-3 min-w-[140px]">Corretora</th>
                                 <th className="p-3 min-w-[140px]">CNPJ Corretora</th>
                                 <th className="p-3 min-w-[100px]">Tipo Negócio</th>
                                 <th className="p-3 min-w-[60px]">C/V</th>
                                 <th className="p-3 min-w-[100px]">Ativo</th>
                                 <th className="p-3 min-w-[100px]">Vencimento</th>
                                 <th className="p-3 text-right min-w-[80px]">Qtd</th>
                                 <th className="p-3 text-right min-w-[120px]">Preço / Ajuste</th>
                                 <th className="p-3 text-right min-w-[120px]">Valor Operação</th>
                                 <th className="p-3 text-center min-w-[60px]">D/C</th>
                                 
                                 {/* Taxas */}
                                 <th className="p-3 text-right min-w-[100px] text-rose-400">Taxa Op.</th>
                                 <th className="p-3 text-right min-w-[100px] text-rose-400">Taxas B3</th>
                                 <th className="p-3 text-right min-w-[100px] text-yellow-500">IRRF</th>
                                 <th className="p-3 text-right min-w-[80px] text-rose-400">ISS</th>

                                 {/* Totais */}
                                 <th className="p-3 text-right min-w-[120px]">Ajuste Posição</th>
                                 <th className="p-3 text-right min-w-[120px] text-rose-500 font-bold">Total Despesas</th>
                                 <th className="p-3 text-right min-w-[120px] text-white bg-slate-800 font-bold">Líquido Nota</th>
                                 
                                 <th className="p-3 min-w-[150px]">Obs</th>
                                 <th className="p-3 text-center sticky right-0 bg-slate-900 z-10 w-12"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-800 text-sm">
                              {sinacorRows.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors group">
                                   <td className="p-2 sticky left-0 bg-slate-950 group-hover:bg-slate-900 z-10 text-slate-600 font-mono text-xs">{idx + 1}</td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-white" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value, true)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-300" value={row.noteNumber} onChange={e => updateRow(row.id, 'noteNumber', e.target.value, true)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-300" value={row.brokerName} onChange={e => updateRow(row.id, 'brokerName', e.target.value, true)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-400 text-xs" value={row.brokerCNPJ} onChange={e => updateRow(row.id, 'brokerCNPJ', e.target.value, true)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-300 uppercase" value={row.businessType} onChange={e => updateRow(row.id, 'businessType', e.target.value, true)} /></td>
                                   
                                   <td className="p-2">
                                     <select className={`bg-transparent outline-none font-bold ${row.cv === 'C' ? 'text-neon-cyan' : 'text-yellow-500'}`} value={row.cv} onChange={e => updateRow(row.id, 'cv', e.target.value, true)}>
                                       <option value="C">C</option><option value="V">V</option>
                                     </select>
                                   </td>
                                   
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none font-bold text-white uppercase" value={row.asset} onChange={e => updateRow(row.id, 'asset', e.target.value, true)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-300" value={row.maturity} onChange={e => updateRow(row.id, 'maturity', e.target.value, true)} /></td>
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-white" value={row.qty} onChange={e => updateRow(row.id, 'qty', Number(e.target.value), true)} /></td>
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-white" value={row.price} onChange={e => updateRow(row.id, 'price', Number(e.target.value), true)} /></td>
                                   <td className="p-2 text-right font-mono text-slate-300">{row.operationValue.toFixed(2)}</td>
                                   
                                   <td className="p-2 text-center">
                                      <span className={`font-bold ${row.dc === 'D' ? 'text-rose-500' : 'text-neon-green'}`}>{row.dc}</span>
                                   </td>

                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-rose-400" value={row.opFee} onChange={e => updateRow(row.id, 'opFee', Number(e.target.value), true)} /></td>
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-rose-400" value={row.b3Fee} onChange={e => updateRow(row.id, 'b3Fee', Number(e.target.value), true)} /></td>
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-yellow-500" value={row.irrf} onChange={e => updateRow(row.id, 'irrf', Number(e.target.value), true)} /></td>
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-rose-400" value={row.iss} onChange={e => updateRow(row.id, 'iss', Number(e.target.value), true)} /></td>
                                   
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-slate-300" value={row.positionAdjustment} onChange={e => updateRow(row.id, 'positionAdjustment', Number(e.target.value), true)} /></td>
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-rose-500 font-bold" value={row.totalExpenses} onChange={e => updateRow(row.id, 'totalExpenses', Number(e.target.value), true)} /></td>
                                   
                                   <td className="p-2 text-right font-bold font-mono text-white bg-slate-800/50">
                                     {row.netTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                                   </td>
                                   
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-400 italic text-xs" placeholder="Obs..." value={row.obs} onChange={e => updateRow(row.id, 'obs', e.target.value, true)} /></td>
                                   <td className="p-2 sticky right-0 bg-slate-950 group-hover:bg-slate-900 z-10 text-center">
                                      <button onClick={() => deleteRow(row.id, true)} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      )}

                      {/* CRYPTO TABLE - DYNAMIC COLUMNS BASED ON EXCHANGE */}
                      {importMode === 'CRYPTO' && (
                        <table className="w-full text-left border-collapse min-w-[1600px]">
                           <thead>
                              <tr className="text-xs uppercase font-bold text-slate-500 bg-slate-900 border-b border-slate-800">
                                 <th className="p-3 sticky left-0 bg-slate-900 z-10 w-10">#</th>
                                 <th className="p-3 min-w-[160px]">Data/Hora</th>
                                 <th className="p-3 min-w-[100px]">Par</th>
                                 <th className="p-3 min-w-[80px]">Lado</th>
                                 
                                 {/* Dynamic Headers */}
                                 {(selectedExchange === 'Binance' || selectedExchange === 'Bybit') && <th className="p-3 min-w-[100px]">Tipo Ordem</th>}
                                 {(selectedExchange === 'Bybit') && <th className="p-3 min-w-[80px]">Posição</th>}
                                 {(selectedExchange === 'Bitget') && <th className="p-3 min-w-[80px]">Categoria</th>}

                                 <th className="p-3 text-right min-w-[100px]">Qtd</th>
                                 <th className="p-3 text-right min-w-[100px]">Preço</th>
                                 <th className="p-3 text-right min-w-[120px]">Valor Total</th>
                                 <th className="p-3 text-right min-w-[80px]">Taxa</th>
                                 <th className="p-3 min-w-[60px]">Moeda</th>
                                 <th className="p-3 text-right min-w-[100px]">PnL</th>
                                 <th className="p-3 min-w-[120px]">Trade ID</th>
                                 <th className="p-3 min-w-[150px]">Obs</th>
                                 <th className="p-3 text-center sticky right-0 bg-slate-900 z-10 w-12"></th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-800 text-sm">
                              {cryptoRows.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors group">
                                   <td className="p-2 sticky left-0 bg-slate-950 group-hover:bg-slate-900 z-10 text-slate-600 font-mono text-xs">{idx + 1}</td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-white font-mono text-xs" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value, false)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none font-bold text-white uppercase" value={row.pair} onChange={e => updateRow(row.id, 'pair', e.target.value, false)} /></td>
                                   <td className="p-2">
                                     <select className={`bg-transparent outline-none font-bold ${row.opType === 'BUY' ? 'text-neon-green' : 'text-rose-500'}`} value={row.opType} onChange={e => updateRow(row.id, 'opType', e.target.value, false)}>
                                       <option value="BUY">BUY</option><option value="SELL">SELL</option>
                                     </select>
                                   </td>

                                   {/* Dynamic Inputs */}
                                   {(selectedExchange === 'Binance' || selectedExchange === 'Bybit') && (
                                      <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-300 text-xs" value={row.orderType || ''} onChange={e => updateRow(row.id, 'orderType', e.target.value, false)} /></td>
                                   )}
                                   {(selectedExchange === 'Bybit') && (
                                      <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-300 text-xs" value={row.position || ''} onChange={e => updateRow(row.id, 'position', e.target.value, false)} /></td>
                                   )}
                                   {(selectedExchange === 'Bitget') && (
                                      <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-300 text-xs" value={row.category || ''} onChange={e => updateRow(row.id, 'category', e.target.value, false)} /></td>
                                   )}

                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-white font-mono" value={row.qty} onChange={e => updateRow(row.id, 'qty', Number(e.target.value), false)} /></td>
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-white font-mono" value={row.price} onChange={e => updateRow(row.id, 'price', Number(e.target.value), false)} /></td>
                                   <td className="p-2 text-right font-mono text-slate-300">{(row.qty * row.price).toFixed(2)}</td>
                                   <td className="p-2"><input type="number" className="bg-transparent w-full outline-none text-right text-rose-400 font-mono" value={row.fee} onChange={e => updateRow(row.id, 'fee', Number(e.target.value), false)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-400 text-xs" value={row.feeCoin} onChange={e => updateRow(row.id, 'feeCoin', e.target.value, false)} /></td>
                                   <td className="p-2"><input type="number" className={`bg-transparent w-full outline-none text-right font-mono ${(row.pnl || 0) >= 0 ? 'text-neon-green' : 'text-rose-500'}`} value={row.pnl || 0} onChange={e => updateRow(row.id, 'pnl', Number(e.target.value), false)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-500 text-xs" value={row.tradeId} onChange={e => updateRow(row.id, 'tradeId', e.target.value, false)} /></td>
                                   <td className="p-2"><input type="text" className="bg-transparent w-full outline-none text-slate-400 italic text-xs" placeholder="Obs..." value={row.obs} onChange={e => updateRow(row.id, 'obs', e.target.value, false)} /></td>
                                   
                                   <td className="p-2 sticky right-0 bg-slate-950 group-hover:bg-slate-900 z-10 text-center">
                                      <button onClick={() => deleteRow(row.id, false)} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      )}

                      {((importMode === 'B3' && sinacorRows.length === 0) || (importMode === 'CRYPTO' && cryptoRows.length === 0)) && (
                         <div className="p-12 text-center text-slate-500">
                            <TriangleAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum dado importado ou detectado.</p>
                         </div>
                      )}
                   </div>
                   
                   <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-500 flex justify-center items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Dica: Você pode editar qualquer célula clicando diretamente nela.
                   </div>
                </div>
             )}
          </div>

          {/* Existing History Table (Kept for context) */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
               <h3 className="font-bold text-white">Histórico de Notas Salvas</h3>
               <span className="text-xs text-slate-500">Última atualização: Hoje, 14:30</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4">Data do Pregão</th>
                    <th className="p-4">Arquivo Fonte</th>
                    <th className="p-4 text-right">Qtd. Ordens</th>
                    <th className="p-4 text-right" title="Soma de corretagem, emolumentos e taxas de registro">Custos Totais</th>
                    <th className="p-4 text-right" title="Imposto retido na fonte (Dedo-duro)">IRRF (Retido)</th>
                    <th className="p-4 text-right">Resultado Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {MOCK_BROKERAGE_NOTES.map((note) => (
                    <tr key={note.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-white font-medium">{note.date}</td>
                      <td className="p-4 text-slate-400 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {note.fileName}
                      </td>
                      <td className="p-4 text-right text-slate-300">{note.totalOperations}</td>
                      <td className="p-4 text-right text-rose-400 font-mono">- R$ {note.costs.toFixed(2)}</td>
                      <td className="p-4 text-right text-yellow-500 font-mono">- R$ {note.irrf.toFixed(2)}</td>
                      <td className={`p-4 text-right font-bold font-mono ${note.netResult >= 0 ? 'text-neon-green' : 'text-neon-rose'}`}>
                        {note.netResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content: Income Tax (IR) */}
      {activeTab === 'tax' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Tax Warning / Info Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <Calculator size={100} className="text-orange-500" />
             </div>
             <div className="relative z-10">
               <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                 <Calculator className="w-6 h-6 text-orange-500" /> Apuração de Resultados & DARF
               </h2>
               <p className="text-slate-400 max-w-2xl text-sm">
                 O cálculo abaixo considera automaticamente o abatimento de prejuízos anteriores, custos operacionais e o IRRF (dedo-duro). 
                 Day Trade é tributado em 20% sobre o lucro líquido, Swing Trade em 15% (exceto vendas abaixo de 20k em ações).
               </p>
             </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Card: Pending Payment */}
             <div className={`p-6 rounded-xl border ${pendingDarf ? 'bg-orange-500/10 border-orange-500/50' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">DARF a Pagar (Atual)</p>
                     {pendingDarf && <p className="text-xs text-orange-400 mt-1">Referente a {pendingDarf.month}</p>}
                   </div>
                   <TriangleAlert className={`w-6 h-6 ${pendingDarf ? 'text-orange-500' : 'text-slate-600'}`} />
                </div>
                <div className="text-3xl font-mono font-bold text-white">
                  {pendingDarf ? pendingDarf.darfValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                </div>
                {pendingDarf && (
                  <button className="mt-4 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded text-sm transition-colors">
                    Gerar DARF (Sicalc)
                  </button>
                )}
             </div>

             {/* Card: Accumulated Loss */}
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Prejuízo Acumulado a Compensar</p>
                   <TrendingDown className="w-6 h-6 text-rose-500" />
                </div>
                <div className="text-3xl font-mono font-bold text-rose-500">
                   R$ 0,00
                </div>
                <p className="text-xs text-slate-500 mt-2">Este valor é abatido automaticamente de lucros futuros.</p>
             </div>

             {/* Card: Total Paid Year */}
             <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex justify-between items-start mb-4">
                   <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Total de Imposto Pago (Ano)</p>
                   <CircleCheck className="w-6 h-6 text-neon-green" />
                </div>
                <div className="text-3xl font-mono font-bold text-white">
                   R$ 424,00
                </div>
                <p className="text-xs text-slate-500 mt-2">Valores já quitados em 2024.</p>
             </div>
          </div>

          {/* Detailed Tax Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50">
               <h3 className="font-bold text-white text-sm">Demonstrativo Mensal de Cálculo</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 min-w-[120px]">Mês de Competência</th>
                    <th className="p-4 text-right min-w-[120px]">Resultado Bruto</th>
                    <th className="p-4 text-right text-rose-400 min-w-[100px]">(-) Custos</th>
                    <th className="p-4 text-right text-orange-400 min-w-[100px]">(-) Prej. Anterior</th>
                    <th className="p-4 text-right font-bold text-white min-w-[120px] bg-slate-800/30">(=) Base de Cálculo</th>
                    <th className="p-4 text-center min-w-[80px]">Alíquota</th>
                    <th className="p-4 text-right min-w-[100px]">Imposto Devido</th>
                    <th className="p-4 text-right text-yellow-500 min-w-[100px]">(-) IRRF</th>
                    <th className="p-4 text-right font-bold text-white min-w-[120px] bg-slate-800/50">Valor da DARF</th>
                    <th className="p-4 text-center min-w-[100px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {MOCK_TAX_RECORDS.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-medium text-white">{record.month}</td>
                      
                      <td className={`p-4 text-right font-mono ${record.grossProfit >= 0 ? 'text-neon-green' : 'text-rose-500'}`}>
                        {record.grossProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      
                      <td className="p-4 text-right font-mono text-rose-400">
                        {record.totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      
                      <td className="p-4 text-right font-mono text-orange-400">
                        {record.accumulatedLoss > 0 ? `(${record.accumulatedLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : '-'}
                      </td>
                      
                      <td className="p-4 text-right font-mono font-bold text-white bg-slate-800/30">
                        {record.taxableBasis > 0 ? record.taxableBasis.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                      </td>
                      
                      <td className="p-4 text-center text-slate-400">
                        {(record.taxRate * 100).toFixed(0)}%
                      </td>
                      
                      <td className="p-4 text-right font-mono text-slate-300">
                        {record.taxDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      
                      <td className="p-4 text-right font-mono text-yellow-500">
                        {record.irrf > 0 ? `(${record.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})` : '-'}
                      </td>
                      
                      <td className="p-4 text-right font-mono font-bold text-white bg-slate-800/50">
                        {record.darfValue > 0 ? record.darfValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '---'}
                      </td>
                      
                      <td className="p-4 text-center">
                        {record.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neon-green/10 text-neon-green text-xs font-bold border border-neon-green/20">
                            <CircleCheck className="w-3 h-3" /> PAGO
                          </span>
                        )}
                        {record.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold border border-orange-500/20">
                            <TriangleAlert className="w-3 h-3" /> PENDENTE
                          </span>
                        )}
                        {record.status === 'CREDIT' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                            ACUMULA
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 text-center">
              * Valores baseados nas importações de notas. A responsabilidade do pagamento da DARF é inteiramente do investidor.
            </div>
          </div>
        </div>
      )}

      {/* Content: Reports (Keep Existing) */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Gerador de Relatórios Gerenciais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
               <div>
                 <label className="block text-xs text-slate-500 mb-1 uppercase">Período</label>
                 <div className="relative">
                   <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                   <select className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-neon-cyan appearance-none">
                     <option>Este Mês</option>
                     <option>Mês Anterior</option>
                     <option>Ano Atual</option>
                   </select>
                 </div>
               </div>
               <div>
                 <label className="block text-xs text-slate-500 mb-1 uppercase">Estratégia</label>
                 <select className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 text-white text-sm focus:outline-none focus:border-neon-cyan">
                     <option>Todas</option>
                     <option>Pullback</option>
                     <option>Rompimento</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs text-slate-500 mb-1 uppercase">Ativo</label>
                 <select className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 text-white text-sm focus:outline-none focus:border-neon-cyan">
                     <option>Todos</option>
                     <option>WIN</option>
                     <option>WDO</option>
                     <option>Ações</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs text-slate-500 mb-1 uppercase">Resultado</label>
                 <select className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-4 text-white text-sm focus:outline-none focus:border-neon-cyan">
                     <option>Todos</option>
                     <option>Gain</option>
                     <option>Loss</option>
                 </select>
               </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors">
                <FileText className="w-4 h-4" /> Gerar PDF Completo
              </button>
              <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> Exportar Excel (.xlsx)
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300 text-center">
              Utilize os filtros acima para gerar relatórios de performance detalhados, incluindo gráficos de eficiência por ativo e curva de capital.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;

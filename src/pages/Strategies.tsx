
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MOCK_STRATEGIES, MOCK_FOLDERS } from '../constants';
import { Strategy, StrategyFolder, CustomField } from '../types';
import { 
  Clock, CircleCheck, CircleX, Plus, X, Save, Trash2, ChevronDown, 
  ChevronRight, Target, Pen, Copy, Image as ImageIcon, Tag, Folder, 
  FolderOpen, GripVertical, LogOut
} from 'lucide-react';

// --- STRATEGY CARD COMPONENT ---
interface StrategyCardProps {
  strategy: Strategy;
  expandedId: string | null;
  onToggle: (id: string) => void;
  onEdit: (e: React.MouseEvent, s: Strategy) => void;
  onDuplicate: (e: React.MouseEvent, s: Strategy) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onViewImage: (e: React.MouseEvent, url: string) => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ 
  strategy, expandedId, onToggle, onEdit, onDuplicate, onDelete, onViewImage 
}) => {
  const isExpanded = expandedId === strategy.id;
  
  return (
    <div 
      className={`bg-slate-900 border rounded-xl transition-all duration-300 overflow-hidden ${isExpanded ? 'border-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)] col-span-1 lg:col-span-2' : 'border-slate-800 hover:border-slate-700'}`}
      onClick={() => onToggle(strategy.id)}
    >
      {/* Header */}
      <div className="p-5 flex items-start gap-4 cursor-pointer">
         {/* Image Thumbnail */}
         <div 
           className="w-20 h-14 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex-shrink-0 relative group"
           onClick={(e) => onViewImage(e, strategy.imageUrl)}
         >
            <img src={strategy.imageUrl} alt={strategy.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
               <ImageIcon className="w-4 h-4 text-white" />
            </div>
         </div>

         {/* Info */}
         <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
               <h3 className={`font-bold text-lg truncate pr-2 ${isExpanded ? 'text-neon-cyan' : 'text-white'}`}>{strategy.name}</h3>
               {strategy.winRate && (
                 <span className={`text-xs font-bold px-2 py-0.5 rounded ${strategy.winRate >= 60 ? 'bg-neon-green/10 text-neon-green' : 'bg-yellow-500/10 text-yellow-500'}`}>
                   {strategy.winRate}% WR
                 </span>
               )}
            </div>
            <p className="text-sm text-slate-400 truncate mt-1">{strategy.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
               {strategy.timeframes.slice(0, 3).map(tf => (
                 <span key={tf} className="text-[10px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                   {tf}
                 </span>
               ))}
               {strategy.timeframes.length > 3 && <span className="text-[10px] text-slate-500">+{strategy.timeframes.length - 3}</span>}
            </div>
         </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-800 bg-slate-950/30 p-6 animate-in slide-in-from-top-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Details */}
              <div className="space-y-6">
                 <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Target className="w-4 h-4" /> Critérios de Entrada</h4>
                    <ul className="space-y-1">
                      {strategy.entryCriteria.map((c, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-neon-green rounded-full mt-1.5 flex-shrink-0"></span>
                          {c}
                        </li>
                      ))}
                    </ul>
                 </div>
                 
                 <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><LogOut className="w-4 h-4" /> Critérios de Saída</h4>
                    <ul className="space-y-1">
                      {strategy.exitCriteria.map((c, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 flex-shrink-0"></span>
                          {c}
                        </li>
                      ))}
                    </ul>
                 </div>

                 {strategy.customFields && strategy.customFields.length > 0 && (
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
                      {strategy.customFields.map(field => (
                        <div key={field.id}>
                           <span className="text-[10px] text-slate-500 uppercase font-bold">{field.label}</span>
                           <p className="text-sm text-white font-medium">{field.value}</p>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              {/* Right: Actions & Stats */}
              <div className="flex flex-col justify-between">
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Estatísticas (Simuladas)</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <span className="block text-2xl font-bold text-white">42</span>
                          <span className="text-xs text-slate-400">Trades realizados</span>
                       </div>
                       <div>
                          <span className="block text-2xl font-bold text-neon-green">1.8</span>
                          <span className="text-xs text-slate-400">Payoff Médio</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 mt-auto">
                    <button onClick={(e) => onEdit(e, strategy)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                       <Pen className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={(e) => onDuplicate(e, strategy)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                       <Copy className="w-4 h-4" /> Duplicar
                    </button>
                    <button onClick={(e) => onDelete(e, strategy.id)} className="py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg font-medium transition-colors border border-rose-500/20">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const Strategies = () => {
  // State for Folders and Strategies
  const [folders, setFolders] = useState<StrategyFolder[]>(MOCK_FOLDERS);
  const [strategies, setStrategies] = useState<Strategy[]>(MOCK_STRATEGIES);
  
  // Expanded state for Folders and Individual Strategies
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set()); // Default all folders closed
  const [expandedStrategyId, setExpandedStrategyId] = useState<string | null>(null);
  
  // Modals State
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Create Folder Modal State (Replaces prompt)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Folder Management
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [tempFolderName, setTempFolderName] = useState("");

  // Strategy Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [winRate, setWinRate] = useState('');
  const [timeframes, setTimeframes] = useState('');
  const [entryCriteria, setEntryCriteria] = useState('');
  const [exitCriteria, setExitCriteria] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  
  // Custom Fields State
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // --- HELPERS ---

  const resetForm = () => {
    setName('');
    setDescription('');
    setWinRate('');
    setTimeframes('');
    setEntryCriteria('');
    setExitCriteria('');
    setImageUrl('');
    setSelectedFolderId(''); // Default to General/No Folder
    setCustomFields([]);
    setEditingStrategyId(null);
  };

  const toggleFolder = (folderId: string) => {
    const newSet = new Set(openFolders);
    if (newSet.has(folderId)) newSet.delete(folderId);
    else newSet.add(folderId);
    setOpenFolders(newSet);
  };

  const toggleStrategyExpand = (id: string) => {
    setExpandedStrategyId(prev => prev === id ? null : id);
  };

  // --- FOLDER ACTIONS ---

  const openCreateFolderModal = () => {
    setNewFolderName('');
    setIsCreateFolderModalOpen(true);
  };

  const handleSaveNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      const newFolder: StrategyFolder = { id: Date.now().toString(), name: newFolderName };
      setFolders([...folders, newFolder]);
      setOpenFolders(prev => {
        const next = new Set(prev);
        next.add(newFolder.id);
        return next;
      });
      setIsCreateFolderModalOpen(false);
      setNewFolderName('');
    }
  };

  const handleEditFolder = (e: React.MouseEvent, folder: StrategyFolder) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setTempFolderName(folder.name);
  };

  const saveFolderEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editingFolderId && tempFolderName.trim()) {
      setFolders(prev => prev.map(f => f.id === editingFolderId ? { ...f, name: tempFolderName } : f));
      setEditingFolderId(null);
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    if (window.confirm("Excluir esta pasta? As estratégias dentro dela serão movidas para 'Sem Pasta'.")) {
      setStrategies(prev => prev.map(s => s.folderId === folderId ? { ...s, folderId: undefined } : s));
      setFolders(prev => prev.filter(f => f.id !== folderId));
    }
  };

  // --- STRATEGY ACTIONS ---

  const handleOpenStrategyModal = (folderId?: string) => {
    resetForm();
    if (folderId) {
      setSelectedFolderId(folderId);
    } else {
      setSelectedFolderId(''); // Force empty selection so user chooses, or keep empty for General
    }
    setIsStrategyModalOpen(true);
  };

  const handleEditStrategy = (e: React.MouseEvent, strategy: Strategy) => {
    e.stopPropagation();
    setName(strategy.name);
    setDescription(strategy.description);
    setWinRate(strategy.winRate?.toString() || '');
    setTimeframes(strategy.timeframes.join(', '));
    setEntryCriteria(strategy.entryCriteria.join('\n'));
    setExitCriteria(strategy.exitCriteria.join('\n'));
    setImageUrl(strategy.imageUrl);
    setSelectedFolderId(strategy.folderId || '');
    setCustomFields(strategy.customFields || []);
    setEditingStrategyId(strategy.id);
    setIsStrategyModalOpen(true);
  };

  const handleDuplicateStrategy = (e: React.MouseEvent, strategy: Strategy) => {
    e.stopPropagation();
    const newStrategy: Strategy = {
      ...strategy,
      id: Date.now().toString(),
      name: `${strategy.name} (Cópia)`
    };
    setStrategies(prev => [newStrategy, ...prev]);
  };

  const handleDeleteStrategy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente excluir esta estratégia?")) {
      setStrategies(prev => prev.filter(s => s.id !== id));
      if (expandedStrategyId === id) setExpandedStrategyId(null);
    }
  };

  const handleViewImage = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    setPreviewImage(url);
  };

  // Custom Fields Management
  const addCustomField = () => {
    setCustomFields([...customFields, { id: Date.now().toString(), label: '', value: '' }]);
  };

  const updateCustomField = (id: string, field: 'label' | 'value', val: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [field]: val } : f));
  };

  const removeCustomField = (id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    
    const strategyData: Strategy = {
      id: editingStrategyId || Date.now().toString(),
      folderId: selectedFolderId || undefined,
      name: name || 'Nova Estratégia',
      description: description || 'Sem descrição',
      timeframes: timeframes.split(',').map(t => t.trim()).filter(t => t !== ''),
      entryCriteria: entryCriteria.split('\n').map(t => t.trim()).filter(t => t !== ''),
      exitCriteria: exitCriteria.split('\n').map(t => t.trim()).filter(t => t !== ''),
      imageUrl: imageUrl || `https://picsum.photos/300/180?random=${Date.now()}`,
      winRate: parseFloat(winRate) || 0,
      customFields: customFields.filter(f => f.label && f.value)
    };

    if (editingStrategyId) {
      setStrategies(prev => prev.map(s => s.id === editingStrategyId ? strategyData : s));
    } else {
      setStrategies(prev => [strategyData, ...prev]);
    }

    setIsStrategyModalOpen(false);
    resetForm();
  };

  // Group strategies by folder
  const strategiesByFolder = (folderId: string) => {
    return strategies.filter(s => s.folderId === folderId);
  };

  const uncategorizedStrategies = strategies.filter(s => !s.folderId || !folders.find(f => f.id === s.folderId));

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h1 className="text-2xl font-bold text-white">Biblioteca de Estratégias</h1>
           <p className="text-slate-400 text-sm">Organize seus setups por cursos, metodologias ou autores.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openCreateFolderModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold rounded-lg transition-colors"
          >
            <Folder className="w-4 h-4" /> Nova Pasta
          </button>
          <button 
            onClick={() => handleOpenStrategyModal()}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-slate-950 font-bold rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Estratégia
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* RENDER FOLDERS */}
        {folders.map((folder) => {
           const folderStrategies = strategiesByFolder(folder.id);
           const isOpen = openFolders.has(folder.id);
           const isRenaming = editingFolderId === folder.id;

           return (
             <div key={folder.id} className="bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden">
               {/* Folder Header */}
               <div 
                 className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between cursor-pointer group select-none"
                 onClick={() => !isRenaming && toggleFolder(folder.id)}
               >
                 <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${isOpen ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-slate-800 text-slate-500'}`}>
                       {isOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                    </div>
                    
                    {isRenaming ? (
                       <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input 
                            type="text" 
                            autoFocus
                            className="bg-slate-950 border border-neon-cyan rounded px-2 py-1 text-white font-bold focus:outline-none"
                            value={tempFolderName}
                            onChange={e => setTempFolderName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveFolderEdit(e)}
                          />
                          <button onClick={saveFolderEdit} className="p-1 text-neon-green hover:bg-slate-800 rounded"><CircleCheck className="w-4 h-4" /></button>
                       </div>
                    ) : (
                       <h2 className="text-lg font-bold text-white flex items-center gap-3">
                         {folder.name}
                         <span className="text-xs font-medium text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                           {folderStrategies.length} setups
                         </span>
                       </h2>
                    )}
                 </div>

                 <div className="flex items-center gap-2">
                    {!isRenaming && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                         <button onClick={(e) => handleEditFolder(e, folder)} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-white rounded-full transition-colors" title="Renomear Pasta">
                           <Pen className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => handleDeleteFolder(e, folder.id)} className="p-2 hover:bg-slate-800 text-slate-500 hover:text-rose-500 rounded-full transition-colors" title="Excluir Pasta">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    )}
                    <div className={`transform transition-transform duration-300 text-slate-500 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                 </div>
               </div>

               {/* Folder Body (Strategies Grid) */}
               {isOpen && (
                 <div className="p-4 bg-slate-950 min-h-[100px]">
                    {folderStrategies.length === 0 ? (
                       <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                          <p className="text-slate-500 text-sm mb-4">Esta pasta está vazia.</p>
                          <button onClick={() => handleOpenStrategyModal(folder.id)} className="text-neon-cyan text-sm font-bold hover:underline flex items-center justify-center gap-1">
                            <Plus className="w-4 h-4" /> Adicionar Setup aqui
                          </button>
                       </div>
                    ) : (
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {folderStrategies.map(strategy => (
                             <StrategyCard 
                               key={strategy.id} 
                               strategy={strategy} 
                               expandedId={expandedStrategyId}
                               onToggle={toggleStrategyExpand}
                               onEdit={handleEditStrategy}
                               onDuplicate={handleDuplicateStrategy}
                               onDelete={handleDeleteStrategy}
                               onViewImage={handleViewImage}
                             />
                          ))}
                       </div>
                    )}
                 </div>
               )}
             </div>
           );
        })}

        {/* UNCATEGORIZED */}
        {uncategorizedStrategies.length > 0 && (
          <div className="mt-8">
            <h3 className="text-slate-500 text-sm uppercase font-bold mb-4 px-2">Estratégias sem Pasta</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {uncategorizedStrategies.map(strategy => (
                 <StrategyCard 
                   key={strategy.id} 
                   strategy={strategy} 
                   expandedId={expandedStrategyId}
                   onToggle={toggleStrategyExpand}
                   onEdit={handleEditStrategy}
                   onDuplicate={handleDuplicateStrategy}
                   onDelete={handleDeleteStrategy}
                   onViewImage={handleViewImage}
                 />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* CREATE FOLDER MODAL */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
               <h3 className="font-bold text-white">Nova Pasta</h3>
               <button onClick={() => setIsCreateFolderModalOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSaveNewFolder} className="p-6">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome da Pasta</label>
               <input 
                 type="text" autoFocus 
                 className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                 placeholder="Ex: Setup do Palex"
                 value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
               />
               <button type="submit" className="w-full mt-6 py-3 bg-neon-cyan text-slate-950 font-bold rounded-lg hover:bg-cyan-600 transition-colors">
                 Criar Pasta
               </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE/EDIT STRATEGY MODAL */}
      {isStrategyModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-slate-950 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <h3 className="font-bold text-white text-lg">{editingStrategyId ? 'Editar Estratégia' : 'Nova Estratégia'}</h3>
                 <button onClick={() => setIsStrategyModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSaveStrategy} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Setup</label>
                       <input 
                         type="text" required placeholder="Ex: Rompimento de Pivot"
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                         value={name} onChange={e => setName(e.target.value)}
                       />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pasta / Categoria</label>
                       <select 
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none appearance-none"
                         value={selectedFolderId} onChange={e => setSelectedFolderId(e.target.value)}
                       >
                         <option value="">Sem Pasta (Geral)</option>
                         {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descrição Curta</label>
                    <input 
                       type="text" placeholder="Resumo do funcionamento..."
                       className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                       value={description} onChange={e => setDescription(e.target.value)}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Winrate Estimado (%)</label>
                       <input 
                         type="number" placeholder="0"
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                         value={winRate} onChange={e => setWinRate(e.target.value)}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timeframes (separar por vírgula)</label>
                       <input 
                         type="text" placeholder="Ex: 5m, 15m, 60m"
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                         value={timeframes} onChange={e => setTimeframes(e.target.value)}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-neon-green">Critérios de Entrada (1 por linha)</label>
                       <textarea 
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-green outline-none h-32 resize-none"
                         placeholder="- Rompimento confirmado&#10;- Volume acima da média"
                         value={entryCriteria} onChange={e => setEntryCriteria(e.target.value)}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-rose-500">Critérios de Saída (1 por linha)</label>
                       <textarea 
                         className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-rose-500 outline-none h-32 resize-none"
                         placeholder="- Alvo de Fibonacci&#10;- Stop técnico acionado"
                         value={exitCriteria} onChange={e => setExitCriteria(e.target.value)}
                       />
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL da Imagem de Exemplo</label>
                    <input 
                       type="text" placeholder="https://..."
                       className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:border-neon-cyan outline-none"
                       value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                    />
                 </div>

                 {/* Custom Fields Section */}
                 <div className="pt-4 border-t border-slate-800">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Campos Personalizados</label>
                    <div className="space-y-3">
                       {customFields.map(field => (
                         <div key={field.id} className="flex gap-3">
                            <input 
                              type="text" placeholder="Rótulo (ex: Autor)"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-neon-cyan outline-none"
                              value={field.label} onChange={e => updateCustomField(field.id, 'label', e.target.value)}
                            />
                            <input 
                              type="text" placeholder="Valor (ex: Stormer)"
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-neon-cyan outline-none"
                              value={field.value} onChange={e => updateCustomField(field.id, 'value', e.target.value)}
                            />
                            <button type="button" onClick={() => removeCustomField(field.id)} className="p-2 text-rose-500 hover:bg-slate-800 rounded"><Trash2 className="w-4 h-4" /></button>
                         </div>
                       ))}
                       <button type="button" onClick={addCustomField} className="text-xs text-neon-cyan hover:underline flex items-center gap-1 font-bold">
                         <Plus className="w-3 h-3" /> Adicionar Campo
                       </button>
                    </div>
                 </div>
              </form>

              <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                 <button onClick={() => setIsStrategyModalOpen(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-bold transition-colors">Cancelar</button>
                 <button onClick={handleSaveStrategy} className="px-6 py-2.5 bg-neon-cyan hover:bg-cyan-600 text-slate-900 font-bold rounded-lg transition-colors flex items-center gap-2">
                   <Save className="w-4 h-4" /> Salvar Estratégia
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
             <button className="fixed top-6 right-6 z-[10000] text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-2 transition-all backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}><X className="w-8 h-8" /></button>
             <img src={previewImage} alt="Strategy Preview" className="w-full h-full object-contain select-none" onClick={(e) => e.stopPropagation()} />
          </div>,
          document.body
      )}
    </div>
  );
};

export default Strategies;
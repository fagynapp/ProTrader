import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronDown, ChevronRight, Plus, Trash2, 
  Image as ImageIcon, SquareCheck, Type, Check, 
  Settings, Save, X, GripVertical, Pen, List, MousePointer2, ToggleLeft, Upload
} from 'lucide-react';
import { Trade, JournalSection, JournalField } from '../types';
import { generateDefaultJournal } from '../constants';

interface TradeDetailsProps {
  trade: Trade;
  onSave: (updatedTrade: Trade) => void;
}

const TradeDetails: React.FC<TradeDetailsProps> = ({ trade, onSave }) => {
  const [journalData, setJournalData] = useState<JournalSection[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [tempSectionTitle, setTempSectionTitle] = useState("");
  
  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{sectionId: string, fieldId: string} | null>(null);

  useEffect(() => {
    if (trade) {
      setJournalData(trade.journal || generateDefaultJournal());
    }
  }, [trade]);

  const handleSave = () => {
    // Sync Strategy Column
    let derivedStrategy = trade.strategy;
    const strategySection = journalData.find(s => s.id === 'strategy');
    if (strategySection) {
      const strategyField = strategySection.fields.find(f => f.id === 'strategies_check');
      if (strategyField) {
        if (strategyField.type === 'checklist' && strategyField.options) {
          const checkedOptions = strategyField.options.filter(opt => opt.checked).map(opt => opt.label);
          derivedStrategy = checkedOptions.length > 0 ? checkedOptions.join(', ') : '---';
        } else if ((strategyField.type === 'text' || strategyField.type === 'select') && strategyField.value) {
           derivedStrategy = String(strategyField.value);
        }
      }
    }

    const updatedTrade = { 
      ...trade, 
      journal: journalData,
      strategy: derivedStrategy 
    };
    
    onSave(updatedTrade);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Helper to safely get images array
  const getImages = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  };

  const toggleSection = (sectionId: string) => {
    if (editingSectionId === sectionId) return;
    setJournalData(prev => prev.map(section => 
      section.id === sectionId ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const startEditingSection = (e: React.MouseEvent, section: JournalSection) => {
    e.stopPropagation();
    setEditingSectionId(section.id);
    setTempSectionTitle(section.title);
    if (!section.isExpanded) {
      setJournalData(prev => prev.map(s => s.id === section.id ? { ...s, isExpanded: true } : s));
    }
  };

  const saveEditing = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (editingSectionId) {
      setJournalData(prev => prev.map(s => 
        s.id === editingSectionId ? { ...s, title: tempSectionTitle } : s
      ));
    }
    setEditingSectionId(null);
  };

  const deleteSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir esta categoria inteira e todos os seus campos?")) {
      setJournalData(prev => prev.filter(s => s.id !== id));
      if (editingSectionId === id) setEditingSectionId(null);
    }
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const newJournal = [...journalData];
    const [draggedItem] = newJournal.splice(draggedIndex, 1);
    newJournal.splice(targetIndex, 0, draggedItem);
    setJournalData(newJournal);
    setDraggedIndex(null);
  };
  const handleDragEnd = () => { setDraggedIndex(null); setActiveDragId(null); };

  // Field Management
  const updateFieldValue = (sectionId: string, fieldId: string, newValue: any) => {
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        fields: section.fields.map(field => field.id === fieldId ? { ...field, value: newValue } : field)
      };
    }));
  };

  // Image Upload Logic
  const handleAddImageClick = (e: React.MouseEvent, sectionId: string, fieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadTarget({ sectionId, fieldId });
    // Trigger the hidden file input
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTarget) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      setJournalData(prev => prev.map(section => {
        if (section.id !== uploadTarget.sectionId) return section;
        return {
          ...section,
          fields: section.fields.map(field => {
            if (field.id !== uploadTarget.fieldId) return field;
            const currentImages = getImages(field.value);
            if (currentImages.length >= 4) {
              alert("Máximo de 4 imagens permitido.");
              return field;
            }
            return { ...field, value: [...currentImages, base64String] };
          })
        };
      }));
      
      // Reset input value to allow selecting the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadTarget(null);
    };
    reader.readAsDataURL(file);
  };

  const removeImageFromField = (sectionId: string, fieldId: string, imageIndex: number) => {
    if (!window.confirm("Remover esta imagem?")) return;
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        fields: section.fields.map(field => {
          if (field.id !== fieldId) return field;
          const currentImages = getImages(field.value);
          const newImages = [...currentImages];
          newImages.splice(imageIndex, 1);
          return { ...field, value: newImages };
        })
      };
    }));
  };

  const toggleChecklistOption = (sectionId: string, fieldId: string, optionId: string) => {
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        fields: section.fields.map(field => {
          if (field.id !== fieldId || !field.options) return field;
          return {
            ...field,
            options: field.options.map(opt => opt.id === optionId ? { ...opt, checked: !opt.checked } : opt)
          };
        })
      };
    }));
  };

  // Structure Editing
  const updateFieldLabel = (sectionId: string, fieldId: string, newLabel: string) => {
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return { ...section, fields: section.fields.map(f => f.id === fieldId ? { ...f, label: newLabel } : f) };
    }));
  };

  const addNewField = (sectionId: string, type: JournalField['type']) => {
    const newField: JournalField = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      label: `Novo Campo (${type})`,
      type: type,
      value: type === 'text' ? '' : (type === 'boolean' ? null : null),
      options: ['checklist', 'select', 'radio'].includes(type) ? [
        { id: Date.now().toString() + '1', label: 'Opção 1', checked: false },
        { id: Date.now().toString() + '2', label: 'Opção 2', checked: false }
      ] : undefined
    };
    setJournalData(prev => prev.map(section => section.id === sectionId ? { ...section, fields: [...section.fields, newField] } : section));
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    if (!window.confirm("Excluir este campo?")) return;
    setJournalData(prev => prev.map(section => section.id === sectionId ? { ...section, fields: section.fields.filter(f => f.id !== fieldId) } : section));
  };

  const addOptionToField = (sectionId: string, fieldId: string, customLabel?: string) => {
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        fields: section.fields.map(field => {
          if (field.id !== fieldId || !field.options) return field;
          return { ...field, options: [...field.options, { id: Date.now().toString(), label: customLabel || 'Nova Opção', checked: false }] };
        })
      };
    }));
  };

  const removeOptionFromField = (sectionId: string, fieldId: string, optionId: string) => {
    if (!window.confirm("Excluir esta opção?")) return;
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return { ...section, fields: section.fields.map(field => {
          if (field.id !== fieldId || !field.options) return field;
          return { ...field, options: field.options.filter(o => o.id !== optionId) };
        })
      };
    }));
  };

  const updateOptionLabel = (sectionId: string, fieldId: string, optionId: string, newLabel: string) => {
     setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return { ...section, fields: section.fields.map(field => {
          if (field.id !== fieldId || !field.options) return field;
          return { ...field, options: field.options.map(opt => opt.id === optionId ? { ...opt, label: newLabel } : opt) };
        })
      };
    }));
  };

  const renameOptionPrompt = (sectionId: string, fieldId: string, optionId: string, currentLabel: string) => {
    const newLabel = prompt("Renomear item:", currentLabel);
    if (newLabel && newLabel !== currentLabel) updateOptionLabel(sectionId, fieldId, optionId, newLabel);
  };

  const addOptionPrompt = (sectionId: string, fieldId: string) => {
    const label = prompt("Nome do novo item:");
    if (label) addOptionToField(sectionId, fieldId, label);
  };

  return (
    <div className="bg-slate-950 p-6 animate-in fade-in duration-300 shadow-inner w-full relative">
       <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-neon-cyan" />
            Diário Operacional do Trade
          </h3>
          <button 
            onClick={handleSave}
            type="button"
            className={`px-4 py-2 text-sm font-bold rounded-lg border transition-all flex items-center gap-2 ${
              saveStatus === 'saved' ? 'bg-neon-green text-slate-950 border-neon-green' : 'bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border-neon-green/20'
            }`}
          >
            {saveStatus === 'saved' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saveStatus === 'saved' ? 'Salvo!' : 'Salvar Alterações'}
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
         {journalData.map((section, index) => {
           const isEditing = editingSectionId === section.id;

           return (
             <div 
               key={section.id}
               draggable={activeDragId === section.id}
               onDragStart={(e) => handleDragStart(e, index)}
               onDragOver={(e) => handleDragOver(e, index)}
               onDrop={(e) => handleDrop(e, index)}
               onDragEnd={handleDragEnd}
               className={`border rounded-lg overflow-hidden transition-all h-fit ${
                 draggedIndex === index ? 'opacity-50 border-dashed border-neon-cyan bg-slate-900/20' 
                 : isEditing ? 'border-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)] bg-slate-900' 
                 : 'border-slate-800 bg-slate-900/50'
               }`}
             >
               <div className={`w-full flex items-center justify-between p-3 border-b transition-colors group bg-slate-900 ${section.isExpanded ? 'border-slate-800/50' : 'border-transparent'}`}>
                 <div className="flex items-center gap-2 flex-1 overflow-hidden">
                   {!isEditing && (
                     <div className="cursor-move text-slate-600 hover:text-neon-cyan p-1 rounded" onMouseEnter={() => setActiveDragId(section.id)} onMouseLeave={() => setActiveDragId(null)} title="Segure para arrastar">
                        <GripVertical className="w-4 h-4" />
                     </div>
                   )}
                   <button type="button" onClick={() => toggleSection(section.id)} className={`p-1 rounded transition-colors ${isEditing ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 text-slate-500 hover:text-white'}`}>
                      {section.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                   </button>
                   {isEditing ? (
                      <input 
                        type="text" autoFocus
                        className="w-full bg-slate-950 border border-neon-cyan text-white text-sm px-2 py-1 rounded focus:outline-none font-bold"
                        value={tempSectionTitle} onChange={(e) => setTempSectionTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditing(e)} onClick={(e) => e.stopPropagation()} placeholder="Nome da Categoria"
                      />
                   ) : (
                      <span onClick={() => toggleSection(section.id)} className={`font-medium text-sm truncate cursor-pointer select-none flex-1 ${section.isExpanded ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                        {section.title}
                      </span>
                   )}
                 </div>

                 <div className="flex items-center gap-1 relative z-10">
                   {isEditing ? (
                     <>
                        <button type="button" onClick={saveEditing} className="px-3 py-1 bg-neon-green text-slate-950 text-xs font-bold rounded hover:bg-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Concluir
                        </button>
                        <button type="button" onClick={(e) => deleteSection(e, section.id)} className="p-1.5 text-slate-500 hover:text-neon-rose hover:bg-slate-800 rounded transition-colors ml-1" title="Excluir Categoria">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </>
                   ) : (
                     <div className="flex gap-1">
                        <button type="button" onClick={(e) => startEditingSection(e, section)} className="p-1.5 text-slate-500 hover:text-neon-cyan hover:bg-slate-800 rounded transition-colors" title="Editar Estrutura">
                          <Pen className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={(e) => deleteSection(e, section.id)} className="p-1.5 text-slate-500 hover:text-neon-rose hover:bg-slate-800 rounded transition-colors cursor-pointer relative z-50" title="Excluir Categoria">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </div>
                   )}
                 </div>
               </div>

               {section.isExpanded && (
                 <div className="p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className={`space-y-5 pl-2 ${isEditing ? 'border-l-2 border-neon-cyan/30 ml-1 pl-3' : ''}`}>
                      {section.fields.map((field) => (
                        <div key={field.id} className="group/field relative">
                           <div className="flex justify-between items-center mb-2">
                              {isEditing ? (
                                <input 
                                  className="bg-transparent border-b border-slate-700 text-xs font-bold text-neon-cyan uppercase tracking-wider w-full focus:outline-none focus:border-neon-cyan py-1"
                                  value={field.label} onChange={(e) => updateFieldLabel(section.id, field.id, e.target.value)} placeholder="NOME DO CAMPO"
                                />
                              ) : (
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                  {field.label}
                                </label>
                              )}
                              {isEditing && (
                                <button type="button" onClick={() => deleteField(section.id, field.id)} className="text-slate-600 hover:text-rose-500 p-1" title="Remover Campo">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                           </div>

                           {field.type === 'text' && (
                             <textarea 
                               className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-sm focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all resize-none"
                               rows={3} placeholder={field.placeholder || "Digite aqui..."} value={field.value} onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)} disabled={isEditing}
                             />
                           )}

                           {field.type === 'select' && (
                             <div className="space-y-2">
                               {!isEditing ? (
                                 <div className="relative">
                                   <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-sm focus:border-neon-cyan focus:outline-none appearance-none cursor-pointer" value={field.value} onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)}>
                                     {field.options?.map(opt => <option key={opt.id} value={opt.label}>{opt.label}</option>)}
                                   </select>
                                   <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                                 </div>
                               ) : (
                                 <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-2 space-y-2">
                                    <span className="text-xs text-slate-500 font-medium block mb-1">Opções do Menu:</span>
                                    {field.options?.map(opt => (
                                      <div key={opt.id} className="flex items-center gap-2">
                                        <input className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-300 focus:border-neon-cyan outline-none" value={opt.label} onChange={(e) => updateOptionLabel(section.id, field.id, opt.id, e.target.value)} />
                                        <button type="button" onClick={() => removeOptionFromField(section.id, field.id, opt.id)} className="p-1 text-rose-500 hover:bg-rose-950 rounded"><X className="w-3 h-3" /></button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => addOptionToField(section.id, field.id)} className="text-xs text-neon-cyan hover:underline flex items-center gap-1 mt-1"><Plus className="w-3 h-3" /> Adicionar Opção</button>
                                 </div>
                               )}
                             </div>
                           )}

                           {field.type === 'radio' && (
                             <div className="flex flex-col gap-2">
                               {!isEditing ? (
                                 field.options?.map(opt => (
                                   <div key={opt.id} className="flex items-center gap-2 group/radio">
                                     <label className={`flex-1 flex items-center p-2 rounded-lg border cursor-pointer transition-all ${field.value === opt.label ? 'bg-neon-cyan/10 border-neon-cyan/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>
                                       <input type="radio" name={`radio-${field.id}`} className="hidden" checked={field.value === opt.label} onChange={() => updateFieldValue(section.id, field.id, opt.label)} />
                                       <div className={`w-3 h-3 rounded-full border mr-3 flex items-center justify-center ${field.value === opt.label ? 'border-neon-cyan' : 'border-slate-600'}`}>
                                         {field.value === opt.label && <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full"></div>}
                                       </div>
                                       <span className="text-sm">{opt.label}</span>
                                     </label>
                                   </div>
                                 ))
                               ) : (
                                 <div className="bg-slate-950/50 rounded-lg border border-slate-800 p-2 space-y-2">
                                    {/* Same structure for radio editing as select */}
                                    {field.options?.map(opt => (
                                      <div key={opt.id} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border border-slate-600"></div>
                                        <input className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-300 focus:border-neon-cyan outline-none" value={opt.label} onChange={(e) => updateOptionLabel(section.id, field.id, opt.id, e.target.value)} />
                                        <button type="button" onClick={() => removeOptionFromField(section.id, field.id, opt.id)} className="p-1 text-rose-500 hover:bg-rose-950 rounded"><X className="w-3 h-3" /></button>
                                      </div>
                                    ))}
                                    <button type="button" onClick={() => addOptionToField(section.id, field.id)} className="text-xs text-neon-cyan hover:underline flex items-center gap-1 mt-1"><Plus className="w-3 h-3" /> Adicionar Opção</button>
                                 </div>
                               )}
                             </div>
                           )}

                           {field.type === 'checklist' && (
                             <div className="space-y-1.5">
                               {field.options?.map(opt => (
                                 <div key={opt.id} className="flex items-center group/opt gap-2">
                                    {!isEditing ? (
                                      <button type="button" onClick={() => toggleChecklistOption(section.id, field.id, opt.id)} className={`flex-1 text-left flex items-center gap-3 p-2 rounded-lg border transition-all ${opt.checked ? 'bg-neon-green/10 border-neon-green/30' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'}`}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${opt.checked ? 'bg-neon-green border-neon-green' : 'border-slate-600'}`}>
                                          {opt.checked && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                                        </div>
                                        <span className={`text-sm ${opt.checked ? 'text-white font-medium' : 'text-slate-400'}`}>{opt.label}</span>
                                      </button>
                                    ) : (
                                      <div className="flex-1 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded border border-slate-600 flex items-center justify-center bg-slate-900 flex-shrink-0"></div>
                                        <input className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-300 focus:border-neon-cyan outline-none" value={opt.label} onChange={(e) => updateOptionLabel(section.id, field.id, opt.id, e.target.value)} />
                                      </div>
                                    )}
                                    <div className={`flex items-center ${isEditing ? 'opacity-100' : 'opacity-100'}`}>
                                      {!isEditing && <button type="button" onClick={() => renameOptionPrompt(section.id, field.id, opt.id, opt.label)} className="p-2 text-slate-600 hover:text-neon-cyan hover:bg-slate-800 rounded transition-colors"><Pen className="w-3.5 h-3.5" /></button>}
                                      <button type="button" onClick={() => removeOptionFromField(section.id, field.id, opt.id)} className="p-2 text-slate-600 hover:text-rose-500 hover:bg-slate-800 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                 </div>
                               ))}
                               <button type="button" onClick={() => isEditing ? addOptionToField(section.id, field.id) : addOptionPrompt(section.id, field.id)} className="flex items-center gap-2 text-xs text-neon-cyan hover:text-cyan-300 mt-2 px-2 py-1 rounded hover:bg-neon-cyan/10 transition-colors"><Plus className="w-3 h-3" /> Adicionar Item</button>
                             </div>
                           )}

                           {field.type === 'boolean' && (
                             <div className="flex items-center gap-2">
                               <button type="button" onClick={() => !isEditing && updateFieldValue(section.id, field.id, true)} className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-all ${field.value === true ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'bg-slate-950 border-slate-800 text-slate-500'} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>Sim</button>
                               <button type="button" onClick={() => !isEditing && updateFieldValue(section.id, field.id, false)} className={`flex-1 py-1.5 rounded-lg border text-sm font-medium transition-all ${field.value === false ? 'bg-neon-rose/20 border-neon-rose text-neon-rose' : 'bg-slate-950 border-slate-800 text-slate-500'} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}>Não</button>
                             </div>
                           )}

                           {field.type === 'image' && (
                             <div className="space-y-3">
                               {!isEditing ? (
                                 <div className="grid grid-cols-2 gap-2">
                                    {getImages(field.value).map((imgUrl: string, idx: number) => (
                                      <div key={idx} className="aspect-square rounded-lg border border-slate-700 overflow-hidden bg-black/40 relative group/img cursor-pointer" onClick={() => setFullScreenImage(imgUrl)}>
                                        <img src={imgUrl} alt={`Setup ${idx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <span className="text-white text-[10px] font-bold bg-slate-900/90 px-2 py-1 rounded-full border border-slate-600 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Expandir</span>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeImageFromField(section.id, field.id, idx); }} className="text-white text-[10px] font-bold bg-rose-500/90 px-2 py-1 rounded-full border border-rose-600 flex items-center gap-1 hover:bg-rose-600"><Trash2 className="w-3 h-3" /> Remover</button>
                                        </div>
                                      </div>
                                    ))}
                                    {getImages(field.value).length < 4 && (
                                      <button type="button" onClick={(e) => handleAddImageClick(e, section.id, field.id)} className="aspect-square rounded-lg border border-dashed border-slate-700 bg-slate-900/30 hover:bg-slate-900 hover:border-neon-cyan/50 flex flex-col items-center justify-center gap-2 transition-all group/btn">
                                        <div className="p-2 rounded-full bg-slate-800 group-hover/btn:bg-neon-cyan/20 group-hover/btn:text-neon-cyan transition-colors"><Upload className="w-4 h-4" /></div>
                                        <span className="text-xs text-slate-500 group-hover/btn:text-slate-300">Carregar</span>
                                      </button>
                                    )}
                                 </div>
                               ) : (
                                 <div className="p-3 bg-slate-900/50 border border-dashed border-slate-700 rounded-lg text-center text-xs text-slate-500">
                                    <ImageIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    Visualização de galeria desativada no modo edição.
                                 </div>
                               )}
                             </div>
                           )}
                        </div>
                      ))}
                      {isEditing && (
                        <div className="pt-4 border-t border-slate-800 mt-6">
                           <p className="text-xs font-bold text-slate-500 uppercase mb-3">Adicionar Novo Campo:</p>
                           <div className="grid grid-cols-3 gap-2">
                              <button type="button" onClick={() => addNewField(section.id, 'text')} className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded hover:border-neon-cyan transition-all text-xs text-slate-300"><Type className="w-4 h-4 mb-1 text-neon-cyan" /> Texto</button>
                              <button type="button" onClick={() => addNewField(section.id, 'checklist')} className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded hover:border-neon-cyan transition-all text-xs text-slate-300"><List className="w-4 h-4 mb-1 text-neon-green" /> Lista</button>
                              <button type="button" onClick={() => addNewField(section.id, 'select')} className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded hover:border-neon-cyan transition-all text-xs text-slate-300"><MousePointer2 className="w-4 h-4 mb-1 text-purple-400" /> Seleção</button>
                              <button type="button" onClick={() => addNewField(section.id, 'radio')} className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded hover:border-neon-cyan transition-all text-xs text-slate-300"><SquareCheck className="w-4 h-4 mb-1 text-orange-400" /> Escolha</button>
                              <button type="button" onClick={() => addNewField(section.id, 'boolean')} className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded hover:border-neon-cyan transition-all text-xs text-slate-300"><ToggleLeft className="w-4 h-4 mb-1 text-blue-400" /> Sim/Não</button>
                              <button type="button" onClick={() => addNewField(section.id, 'image')} className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded hover:border-neon-cyan transition-all text-xs text-slate-300"><ImageIcon className="w-4 h-4 mb-1 text-rose-400" /> Galeria</button>
                           </div>
                        </div>
                      )}
                    </div>
                 </div>
               )}
             </div>
           );
         })}

         <button 
           type="button"
           onClick={() => {
             const title = prompt("Nome da nova categoria:");
             if(title) setJournalData(prev => [...prev, { id: Date.now().toString(), title, isExpanded: true, fields: [] }])
           }}
           className="h-16 border border-dashed border-slate-800 rounded-lg text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all flex items-center justify-center gap-2"
         >
           <Plus className="w-5 h-5" />
           <span className="text-sm font-medium">Nova Categoria</span>
         </button>
       </div>

      {/* Hidden File Input for Image Uploads */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {fullScreenImage && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-in fade-in duration-200" onClick={() => setFullScreenImage(null)}>
             <button className="fixed top-6 right-6 z-[10000] text-white/50 hover:text-white bg-black/20 hover:bg-black/50 rounded-full p-2 transition-all backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); }}><X className="w-8 h-8" /></button>
             <img src={fullScreenImage} alt="Full Screen Setup" className="w-full h-full object-contain select-none" onClick={(e) => e.stopPropagation()} />
          </div>,
          document.body
      )}
    </div>
  );
};

export default TradeDetails;
import React, { useState, useEffect } from 'react';
import { 
  X, ChevronDown, ChevronRight, Plus, Trash2, 
  Image as ImageIcon, SquareCheck, Type, Check, 
  CircleAlert, Save, CornerDownRight, Settings
} from 'lucide-react';
import { Trade, TradeType, JournalSection, JournalField } from '../types';
import { generateDefaultJournal } from '../constants';

interface TradeDrawerProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
}

const TradeDrawer: React.FC<TradeDrawerProps> = ({ trade, isOpen, onClose }) => {
  // Local state to manage the journal data independently for editing
  const [journalData, setJournalData] = useState<JournalSection[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize journal data when trade changes
  useEffect(() => {
    if (trade) {
      // If trade has journal data, use it, otherwise generate default
      setJournalData(trade.journal || generateDefaultJournal());
    }
  }, [trade]);

  if (!trade) return null;

  // Toggle Section Expansion
  const toggleSection = (sectionId: string) => {
    setJournalData(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isExpanded: !section.isExpanded } 
        : section
    ));
  };

  // Update Field Value
  const updateFieldValue = (sectionId: string, fieldId: string, newValue: any) => {
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        fields: section.fields.map(field => 
          field.id === fieldId ? { ...field, value: newValue } : field
        )
      };
    }));
  };

  // Checklist Toggle
  const toggleChecklistOption = (sectionId: string, fieldId: string, optionId: string) => {
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        fields: section.fields.map(field => {
          if (field.id !== fieldId || !field.options) return field;
          return {
            ...field,
            options: field.options.map(opt => 
              opt.id === optionId ? { ...opt, checked: !opt.checked } : opt
            )
          };
        })
      };
    }));
  };

  // Add new option to checklist
  const addChecklistOption = (sectionId: string, fieldId: string) => {
    const label = prompt("Nome do novo item:");
    if (!label) return;
    
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        fields: section.fields.map(field => {
          if (field.id !== fieldId || !field.options) return field;
          return {
            ...field,
            options: [...field.options, { id: Date.now().toString(), label, checked: true }]
          };
        })
      };
    }));
  };

  // Delete option from checklist
  const deleteChecklistOption = (sectionId: string, fieldId: string, optionId: string) => {
    if (!window.confirm("Remover este item?")) return;
    setJournalData(prev => prev.map(section => {
      if (section.id !== sectionId) return section;
      return {
        ...section,
        fields: section.fields.map(field => {
          if (field.id !== fieldId || !field.options) return field;
          return {
            ...field,
            options: field.options.filter(opt => opt.id !== optionId)
          };
        })
      };
    }));
  };

  // Add New Field to Section
  const addFieldToSection = (sectionId: string) => {
    const label = prompt("Nome do novo campo:");
    if (!label) return;
    
    // Simple selection for demo purposes
    const type = window.confirm("Deseja criar uma Checklist? (Cancel para Texto)") ? 'checklist' : 'text';

    const newField: JournalField = {
      id: Date.now().toString(),
      label,
      type: type as any,
      value: type === 'text' ? '' : null,
      options: type === 'checklist' ? [
        { id: '1', label: 'Opção 1', checked: false },
        { id: '2', label: 'Opção 2', checked: false }
      ] : undefined
    };

    setJournalData(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, fields: [...section.fields, newField], isExpanded: true } 
        : section
    ));
  };

  // Delete Field
  const deleteField = (sectionId: string, fieldId: string) => {
    if (!window.confirm("Excluir este campo permanentemente?")) return;
    setJournalData(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, fields: section.fields.filter(f => f.id !== fieldId) } 
        : section
    ));
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer Panel - Extended Width for Journal */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[750px] bg-slate-950 border-l border-slate-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header Fixed */}
        <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 p-6 flex justify-between items-start z-20 shadow-md">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h2 className="text-2xl font-bold text-white tracking-tight">{trade.asset}</h2>
               <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${trade.type === TradeType.BUY ? 'border-neon-green text-neon-green bg-neon-green/5' : 'border-neon-rose text-neon-rose bg-neon-rose/5'}`}>
                 {trade.type}
               </span>
               <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border bg-slate-900 border-slate-700 text-slate-400`}>
                 {trade.status}
               </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
               <span>{trade.date}</span>
               <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
               <span className="font-mono">{trade.entryPrice} <span className="text-slate-600">➜</span> {trade.exitPrice || '---'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
               <p className="text-xs text-slate-500 uppercase font-bold">Resultado</p>
               <p className={`text-2xl font-mono font-bold ${trade.pnl && trade.pnl >= 0 ? 'text-neon-green' : 'text-neon-rose'}`}>
                 {trade.pnl ? trade.pnl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '---'}
               </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Journal Content - Scrollable */}
        <div className="flex-1 p-6 space-y-2 bg-slate-950">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-neon-cyan" />
                Diário Operacional
              </h3>
              <span className="text-xs text-slate-500 italic">
                Todos os campos são editáveis e salvos automaticamente.
              </span>
           </div>

           {/* Sections Tree */}
           <div className="space-y-3">
             {journalData.map((section) => (
               <div key={section.id} className="border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden transition-all">
                 
                 {/* Section Header */}
                 <button 
                   onClick={() => toggleSection(section.id)}
                   className="w-full flex items-center justify-between p-4 hover:bg-slate-800/80 transition-colors text-left group"
                 >
                   <div className="flex items-center gap-3">
                     {section.isExpanded ? 
                        <ChevronDown className="w-4 h-4 text-neon-green" /> : 
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                     }
                     <span className={`font-medium ${section.isExpanded ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                       {section.title}
                     </span>
                   </div>
                   {section.isExpanded && (
                     <div 
                       onClick={(e) => { e.stopPropagation(); addFieldToSection(section.id); }}
                       className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded text-neon-cyan"
                       title="Adicionar Campo Personalizado"
                     >
                       <Plus className="w-4 h-4" />
                     </div>
                   )}
                 </button>

                 {/* Section Content */}
                 {section.isExpanded && (
                   <div className="p-4 pt-0 border-t border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-5 mt-4 pl-3 border-l-2 border-slate-800 ml-2">
                        
                        {section.fields.map((field) => (
                          <div key={field.id} className="group/field relative">
                             
                             {/* Delete Field Button */}
                             <button 
                               onClick={() => deleteField(section.id, field.id)}
                               className="absolute -right-2 -top-2 opacity-0 group-hover/field:opacity-100 p-1 text-rose-500 hover:bg-rose-950 rounded transition-all"
                               title="Excluir Campo"
                             >
                               <Trash2 className="w-3 h-3" />
                             </button>

                             <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                               {field.label}
                               {field.type === 'checklist' && <SquareCheck className="w-3 h-3 text-slate-600" />}
                               {field.type === 'text' && <Type className="w-3 h-3 text-slate-600" />}
                             </label>

                             {/* Render Field Based on Type */}
                             
                             {/* TEXT TYPE */}
                             {field.type === 'text' && (
                               <textarea 
                                 className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan transition-all resize-none"
                                 rows={3}
                                 placeholder={field.placeholder || "Digite aqui..."}
                                 value={field.value}
                                 onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)}
                               />
                             )}

                             {/* SELECT TYPE */}
                             {field.type === 'select' && (
                               <div className="relative">
                                 <select 
                                   className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:border-neon-cyan focus:outline-none appearance-none cursor-pointer"
                                   value={field.value}
                                   onChange={(e) => updateFieldValue(section.id, field.id, e.target.value)}
                                 >
                                   {field.options?.map(opt => (
                                     <option key={opt.id} value={opt.label}>{opt.label}</option>
                                   ))}
                                 </select>
                                 <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                               </div>
                             )}

                             {/* RADIO TYPE (Custom UI) */}
                             {field.type === 'radio' && (
                               <div className="flex flex-col gap-2">
                                 {field.options?.map(opt => (
                                   <label key={opt.id} className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${field.value === opt.label ? 'bg-neon-cyan/10 border-neon-cyan/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'}`}>
                                     <input 
                                       type="radio" 
                                       name={`radio-${field.id}`}
                                       className="hidden"
                                       checked={field.value === opt.label}
                                       onChange={() => updateFieldValue(section.id, field.id, opt.label)}
                                     />
                                     <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${field.value === opt.label ? 'border-neon-cyan' : 'border-slate-600'}`}>
                                       {field.value === opt.label && <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>}
                                     </div>
                                     <span className="text-sm">{opt.label}</span>
                                   </label>
                                 ))}
                               </div>
                             )}

                             {/* CHECKLIST TYPE */}
                             {field.type === 'checklist' && (
                               <div className="space-y-2">
                                 {field.options?.map(opt => (
                                   <div key={opt.id} className="flex items-center group/opt">
                                      <button 
                                        onClick={() => toggleChecklistOption(section.id, field.id, opt.id)}
                                        className={`flex-1 text-left flex items-center gap-3 p-2 rounded-lg border transition-all ${opt.checked ? 'bg-neon-green/10 border-neon-green/30' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'}`}
                                      >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${opt.checked ? 'bg-neon-green border-neon-green' : 'border-slate-600'}`}>
                                          {opt.checked && <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />}
                                        </div>
                                        <span className={`text-sm ${opt.checked ? 'text-white font-medium' : 'text-slate-400'}`}>{opt.label}</span>
                                      </button>
                                      
                                      <button 
                                        onClick={() => deleteChecklistOption(section.id, field.id, opt.id)}
                                        className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                   </div>
                                 ))}
                                 <button 
                                   onClick={() => addChecklistOption(section.id, field.id)}
                                   className="flex items-center gap-2 text-xs text-neon-cyan hover:text-cyan-300 mt-2 px-2 py-1 rounded hover:bg-neon-cyan/10 transition-colors"
                                 >
                                   <Plus className="w-3 h-3" /> Adicionar Item
                                 </button>
                               </div>
                             )}

                             {/* BOOLEAN TYPE */}
                             {field.type === 'boolean' && (
                               <div className="flex items-center gap-4">
                                 <button 
                                   onClick={() => updateFieldValue(section.id, field.id, true)}
                                   className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${field.value === true ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                 >
                                   Sim
                                 </button>
                                 <button 
                                   onClick={() => updateFieldValue(section.id, field.id, false)}
                                   className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${field.value === false ? 'bg-neon-rose/20 border-neon-rose text-neon-rose' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                 >
                                   Não
                                 </button>
                               </div>
                             )}

                             {/* IMAGE TYPE */}
                             {field.type === 'image' && (
                               <div className="space-y-3">
                                 <div className="aspect-video rounded-lg border border-slate-700 overflow-hidden bg-black/40 relative group/img">
                                    {field.value ? (
                                      <img src={field.value} alt="Trade Setup" className="w-full h-full object-contain" />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                         <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                         <span className="text-xs">Sem imagem</span>
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                       <button className="bg-white text-black px-3 py-1.5 rounded text-xs font-bold">Ver Fullscreen</button>
                                       <button className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold border border-slate-600">Alterar</button>
                                    </div>
                                 </div>
                                 <button className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 text-xs hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
                                   <Plus className="w-3 h-3" /> Upload Nova Imagem
                                 </button>
                               </div>
                             )}

                          </div>
                        ))}
                      </div>
                   </div>
                 )}
               </div>
             ))}
           </div>

           {/* Add New Section Button */}
           <button 
             onClick={() => {
               const title = prompt("Nome da nova categoria:");
               if(title) {
                  setJournalData(prev => [...prev, { id: Date.now().toString(), title, isExpanded: true, fields: [] }])
               }
             }}
             className="w-full py-4 mt-4 border border-dashed border-slate-800 rounded-xl text-slate-500 hover:text-neon-cyan hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all flex flex-col items-center justify-center gap-2"
           >
             <Plus className="w-6 h-6" />
             <span className="text-sm font-medium">Criar Nova Categoria Personalizada</span>
           </button>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-950 border-t border-slate-800 p-6 z-20">
          <button 
            onClick={onClose} 
            className="w-full bg-gradient-to-r from-neon-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Salvar Diário
          </button>
        </div>

      </div>
    </>
  );
};

export default TradeDrawer;
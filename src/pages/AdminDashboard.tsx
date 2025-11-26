
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, Shield, Search, Filter, CircleCheck, CircleX, 
  EllipsisVertical, BarChart2, TrendingUp, TriangleAlert, 
  UserCheck, UserX, Clock, Flame, Activity, Download, Database, Archive
} from 'lucide-react';
import { MOCK_USERS, MOCK_TRADES, MOCK_STRATEGIES, MOCK_INVESTMENTS, MOCK_MINDSET_HISTORY, MOCK_BROKERAGE_NOTES, MOCK_TAX_RECORDS } from '../constants';
import { UserAccount, UserStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import JSZip from 'jszip';

const AdminDashboard = () => {
  // Initialize with LocalStorage data if available, otherwise use MOCK
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('protrader_users_db');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [filterStatus, setFilterStatus] = useState<'ALL' | UserStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Store only ID to ensure selectedUser is always in sync with users list
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Derive selected user from the master list
  const selectedUser = useMemo(() => 
    users.find(u => u.id === selectedUserId) || null
  , [users, selectedUserId]);

  // --- ACTIONS ---

  const handleStatusChange = (userId: string, newStatus: UserStatus) => {
    // Update State
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);
    
    // Persist
    localStorage.setItem('protrader_users_db', JSON.stringify(updatedUsers));
  };

  // --- EXPORT BACKUP ZIP ---
  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      // Create Folders
      const dataFolder = zip.folder("database");
      const metaFolder = zip.folder("metadata");

      // Add Data Files
      dataFolder?.file("users.json", JSON.stringify(users, null, 2));
      dataFolder?.file("trades.json", JSON.stringify(MOCK_TRADES, null, 2)); // In a real app, this would be from LS or DB
      dataFolder?.file("strategies.json", JSON.stringify(MOCK_STRATEGIES, null, 2));
      dataFolder?.file("investments.json", JSON.stringify(MOCK_INVESTMENTS, null, 2));
      dataFolder?.file("mindset_history.json", JSON.stringify(MOCK_MINDSET_HISTORY, null, 2));
      dataFolder?.file("finance_notes.json", JSON.stringify(MOCK_BROKERAGE_NOTES, null, 2));
      dataFolder?.file("tax_records.json", JSON.stringify(MOCK_TAX_RECORDS, null, 2));

      // Add Metadata
      metaFolder?.file("export_info.txt", `Exportado em: ${new Date().toLocaleString()}\nGerado por: AdminDashboard\nVersão do Sistema: 1.0.0`);

      // Generate Zip
      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger Download
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PROTRADER_BACKUP_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Erro ao gerar backup:", error);
      alert("Erro ao gerar o arquivo ZIP.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- FILTERS ---

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesStatus = filterStatus === 'ALL' || user.status === filterStatus;
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [users, filterStatus, searchQuery]);

  // --- MOCK CHART DATA FOR SELECTED USER ---
  const userPerformanceData = [
    { name: 'Sem 1', discipline: 65, profit: 40 },
    { name: 'Sem 2', discipline: 75, profit: 60 },
    { name: 'Sem 3', discipline: 50, profit: -20 },
    { name: 'Sem 4', discipline: 90, profit: 80 },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white flex items-center gap-3">
             <Shield className="w-6 h-6 text-neon-cyan" /> Painel do Administrador
           </h1>
           <p className="text-slate-400 text-sm">Gerencie usuários, aprove acessos e acompanhe a evolução dos traders.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span className="text-sm font-bold text-white">{users.filter(u => u.status === 'PENDING').length} Pendentes</span>
           </div>
           <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green"></span>
              <span className="text-sm font-bold text-white">{users.filter(u => u.status === 'ACTIVE').length} Ativos</span>
           </div>
        </div>
      </div>

      {/* SYSTEM MAINTENANCE BAR */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
               <Database className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
               <h3 className="font-bold text-white text-sm">Manutenção do Sistema</h3>
               <p className="text-xs text-slate-400">Exporte todos os dados do banco para segurança.</p>
            </div>
         </div>
         <button 
           onClick={handleDownloadBackup}
           disabled={isExporting}
           className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
         >
           {isExporting ? (
             <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
           ) : (
             <Download className="w-4 h-4" />
           )}
           {isExporting ? 'Gerando ZIP...' : 'Baixar Backup Completo (.zip)'}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: USER LIST */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
           {/* Filters Toolbar */}
           <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between bg-slate-950/30">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                 <input 
                   type="text" 
                   placeholder="Buscar por nome ou e-mail..." 
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-neon-cyan"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className="flex gap-2">
                 {(['ALL', 'PENDING', 'ACTIVE', 'BLOCKED'] as const).map(status => (
                   <button
                     key={status}
                     onClick={() => setFilterStatus(status)}
                     className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                       filterStatus === status 
                         ? 'bg-slate-800 text-white border border-slate-600' 
                         : 'text-slate-500 hover:text-slate-300'
                     }`}
                   >
                     {status === 'ALL' ? 'Todos' : status === 'PENDING' ? 'Pendentes' : status === 'ACTIVE' ? 'Ativos' : 'Bloq.'}
                   </button>
                 ))}
              </div>
           </div>

           {/* Table */}
           <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-950 sticky top-0 z-10 shadow-sm">
                    <tr className="text-slate-500 text-xs uppercase font-bold tracking-wider">
                       <th className="p-4">Usuário</th>
                       <th className="p-4">Status</th>
                       <th className="p-4">Nível</th>
                       <th className="p-4 text-right">Ações</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 text-sm">
                    {filteredUsers.map(user => (
                       <tr 
                         key={user.id} 
                         onClick={() => setSelectedUserId(user.id)}
                         className={`cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-slate-800/80 border-l-4 border-l-neon-cyan' : 'hover:bg-slate-800/30 border-l-4 border-l-transparent'}`}
                       >
                          <td className="p-4">
                             <p className="font-bold text-white">{user.name}</p>
                             <p className="text-xs text-slate-500">{user.email}</p>
                          </td>
                          <td className="p-4">
                             {user.status === 'PENDING' && <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">Pendente</span>}
                             {user.status === 'ACTIVE' && <span className="px-2 py-1 rounded bg-neon-green/10 text-neon-green text-xs font-bold border border-neon-green/20">Ativo</span>}
                             {user.status === 'BLOCKED' && <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">Bloqueado</span>}
                          </td>
                          <td className="p-4">
                             <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${user.currentConsistencyLevel === 'CONSISTÊNCIA ABSOLUTA' ? 'bg-yellow-500' : 'bg-slate-600'}`}></span>
                                <span className="text-slate-300 text-xs font-medium">{user.currentConsistencyLevel}</span>
                             </div>
                          </td>
                          <td className="p-4 text-right">
                             <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400">
                                <EllipsisVertical className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                       <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-500">
                             Nenhum usuário encontrado.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>

        {/* RIGHT COLUMN: DETAIL PANEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[600px]">
           {selectedUser ? (
              <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4">
                 {/* User Header */}
                 <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-slate-500 border-4 border-slate-700">
                       {selectedUser.name.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
                    <p className="text-sm text-slate-500 mb-4">Membro desde {selectedUser.joinDate}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3">
                       {selectedUser.status === 'PENDING' && (
                          <button 
                            onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE')}
                            className="px-4 py-2 bg-neon-green hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors"
                          >
                             <UserCheck className="w-4 h-4" /> Aprovar Acesso
                          </button>
                       )}
                       {selectedUser.status === 'ACTIVE' && (
                          <button 
                            onClick={() => handleStatusChange(selectedUser.id, 'BLOCKED')}
                            className="px-4 py-2 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 font-bold rounded-lg text-sm flex items-center gap-2 border border-slate-700 transition-colors"
                          >
                             <UserX className="w-4 h-4" /> Bloquear
                          </button>
                       )}
                       {selectedUser.status === 'BLOCKED' && (
                          <button 
                            onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE')}
                            className="px-4 py-2 bg-slate-800 hover:bg-neon-green/20 hover:text-neon-green text-slate-400 font-bold rounded-lg text-sm flex items-center gap-2 border border-slate-700 transition-colors"
                          >
                             <UserCheck className="w-4 h-4" /> Reativar
                          </button>
                       )}
                    </div>
                 </div>

                 {/* Stats Grid */}
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                       <p className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" /> Streak
                       </p>
                       <p className="text-lg font-bold text-white">{selectedUser.streak} Dias</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                       <p className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
                          <Activity className="w-3 h-3 text-neon-cyan" /> Disciplina
                       </p>
                       <p className="text-lg font-bold text-white">{selectedUser.avgDiscipline}%</p>
                    </div>
                 </div>

                 {/* Evolution Chart */}
                 <div className="flex-1 min-h-[150px] bg-slate-950/50 rounded-xl border border-slate-800 p-4 relative">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Evolução Recente</p>
                    <ResponsiveContainer width="100%" height="80%">
                       <BarChart data={userPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }} />
                          <Bar dataKey="discipline" fill="#06B6D4" radius={[2, 2, 0, 0]} name="Disciplina" />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-500">Último login: <span className="text-white">{selectedUser.lastLogin}</span></p>
                 </div>
              </div>
           ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                 <Users className="w-16 h-16 mb-4 opacity-20" />
                 <p className="text-sm font-medium">Selecione um usuário para ver detalhes.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

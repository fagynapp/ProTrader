import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BookOpen, 
  PieChart, 
  DollarSign, 
  Home,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  EyeOff,
  BrainCircuit,
  Map as MapIcon,
  Shield,
  LogOut,
  Crown,
  Lock
} from 'lucide-react';
import { UserAccount } from '../types';
import UpgradeModal from './UpgradeModal';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onSearchClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, onSearchClick }) => {
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem('protrade_show_balance');
    return saved !== 'false'; // Default to true
  });
  
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleBalance = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newState = !showBalance;
    setShowBalance(newState);
    localStorage.setItem('protrade_show_balance', String(newState));
  };

  // Helper to check user
  const userString = localStorage.getItem('protrader_user');
  const user: UserAccount = userString ? JSON.parse(userString) : {};
  const isAdmin = user.role === 'ADMIN';
  const isPremium = user.plan === 'PREMIUM';

  // Define Premium Routes
  const PREMIUM_ROUTES = ['/strategies', '/calculator', '/investments', '/finance', '/trader-map'];

  const navItems = [
    { name: 'Home', path: '/', icon: Home, isPremium: false },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, isPremium: false },
    { name: 'Diário de Trading', path: '/trades', icon: TrendingUp, isPremium: false },
    { name: 'Mindset', path: '/mindset', icon: BrainCircuit, isPremium: false }, // Partially restricted inside
    { name: 'Estratégias', path: '/strategies', icon: BookOpen, isPremium: true },
    { name: 'Calculadora', path: '/calculator', icon: Calculator, isPremium: true },
    { name: 'Investimentos', path: '/investments', icon: PieChart, isPremium: true },
    { name: 'Financeiro', path: '/finance', icon: DollarSign, isPremium: true },
    { name: 'Mapa Trader', path: '/trader-map', icon: MapIcon, isPremium: true },
  ];

  const handleNavigation = (e: React.MouseEvent, path: string, isItemPremium: boolean) => {
    if (!isPremium && isItemPremium) {
      e.preventDefault();
      setIsUpgradeModalOpen(true);
    }
  };

  return (
    <>
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName="Recurso Premium"
      />

      <aside 
        className={`h-screen fixed left-0 top-0 bg-slate-950 border-r border-slate-800 flex flex-col z-50 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo Area */}
        <div className={`h-16 flex items-center border-b border-slate-800 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-start px-6'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-cyan rounded-md flex-shrink-0 flex items-center justify-center">
              {/* Logo Icon or Letter */}
          </div>
          <div className={`ml-3 flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
             <h1 className="text-xl font-bold tracking-tight text-white font-sans whitespace-nowrap">
               PRO<span className="text-neon-green">TRADER</span>
             </h1>
          </div>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={onToggle}
          className="absolute -right-3 top-20 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg z-50 flex items-center justify-center"
          title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* User Plan Badge (If Expanded) */}
        {!isCollapsed && (
           <div className="px-4 pt-4">
               {isPremium ? (
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-yellow-500/30 rounded-lg p-2 flex items-center justify-center gap-2 shadow-sm">
                     <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                     <span className="text-xs font-bold text-yellow-500 tracking-wider">PREMIUM</span>
                  </div>
               ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center justify-center gap-2">
                     <span className="text-xs font-bold text-slate-500 tracking-wider">BÁSICO</span>
                  </div>
               )}
           </div>
        )}

        {/* Search Trigger */}
        <div className={`px-3 py-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button 
            onClick={onSearchClick}
            className={`flex items-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all rounded-lg group ${
              isCollapsed ? 'p-3 justify-center' : 'w-full px-4 py-2.5'
            }`}
            title="Buscar (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-neon-cyan group-hover:text-cyan-300" />
            {!isCollapsed && (
               <div className="flex flex-1 justify-between items-center">
                  <span className="text-sm font-medium">Buscar...</span>
                  <span className="text-sm text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-500">ESC</span>
               </div>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navItems.map((item) => {
            const isLocked = !isPremium && item.isPremium;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavigation(e, item.path, item.isPremium)}
                className={({ isActive }) =>
                  `flex items-center py-3 rounded-lg transition-all duration-200 group relative ${
                    isCollapsed ? 'justify-center px-2' : 'px-4'
                  } ${
                    isActive && !isLocked
                      ? 'bg-slate-800 text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : isLocked 
                        ? 'text-slate-600 hover:bg-slate-900/50 cursor-not-allowed'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <div className="relative">
                   <item.icon className={`w-5 h-5 flex-shrink-0 transition-all ${!isCollapsed ? 'mr-3' : ''} ${isLocked ? 'opacity-50' : ''}`} />
                   {isLocked && isCollapsed && (
                     <div className="absolute -top-1 -right-1 bg-slate-950 rounded-full">
                       <Lock className="w-2.5 h-2.5 text-slate-500" />
                     </div>
                   )}
                </div>
                
                <span 
                  className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 flex-1 flex items-center justify-between ${
                    isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                  }`}
                >
                  {item.name}
                  {isLocked && <Lock className="w-3.5 h-3.5 text-slate-500 ml-2" />}
                </span>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl translate-x-2 group-hover:translate-x-0 transition-all flex items-center gap-2">
                    {item.name}
                    {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                    <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-slate-800"></div>
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* ADMIN LINK (Only if Admin) */}
          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-slate-800">
               {!isCollapsed && <p className="px-4 text-[10px] font-bold text-slate-500 uppercase mb-2">Administração</p>}
               <NavLink
                 to="/admin"
                 className={({ isActive }) =>
                   `flex items-center py-3 rounded-lg transition-all duration-200 group relative ${
                     isCollapsed ? 'justify-center px-2' : 'px-4'
                   } ${
                     isActive
                       ? 'bg-slate-800 text-neon-green shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                       : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                   }`
                 }
               >
                 <Shield className={`w-5 h-5 flex-shrink-0 transition-all ${!isCollapsed ? 'mr-3' : ''}`} />
                 <span 
                   className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                     isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                   }`}
                 >
                   Painel Admin
                 </span>
               </NavLink>
            </div>
          )}
        </nav>
        
        {/* Footer Status - Compacted */}
        <div className={`p-2 border-t border-slate-800 transition-all duration-300 flex flex-col gap-1 ${isCollapsed ? 'items-center' : ''}`}>
          
          {/* Logout Button */}
          <NavLink to="/login" className={`flex items-center justify-center p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors w-full ${isCollapsed ? '' : 'gap-2'}`} title="Sair">
             <LogOut size={16} />
             {!isCollapsed && <span className="text-xs font-bold">Sair</span>}
          </NavLink>

          {isCollapsed ? (
             <div 
               onClick={(e) => toggleBalance(e)}
               className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-neon-green font-bold text-sm cursor-pointer group relative shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:bg-slate-800 transition-colors" 
               title="Clique para mostrar/ocultar saldo"
             >
               $
               <div className="absolute left-full ml-4 bottom-0 mb-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl w-48 cursor-default">
                  <p className="text-xs text-slate-500">Total em Conta</p>
                  <p className="font-bold font-mono text-neon-green">
                    {showBalance ? 'R$ 125.420' : 'R$ •••••••'}
                  </p>
               </div>
             </div>
          ) : (
            <div className="bg-slate-900 rounded-lg p-2.5 animate-in fade-in duration-200 border border-slate-800/50">
               <div className="flex justify-between items-center mb-1">
                 <p className="text-[10px] text-slate-500 uppercase font-bold">Capital</p>
                 <button 
                   onClick={toggleBalance}
                   className="text-slate-500 hover:text-neon-cyan transition-colors p-0.5 rounded hover:bg-slate-800"
                   title={showBalance ? "Ocultar Saldo" : "Mostrar Saldo"}
                 >
                   {showBalance ? <Eye size={12} /> : <EyeOff size={12} />}
                 </button>
               </div>
               <p className="text-sm font-mono font-bold text-white">
                 {showBalance ? 'R$ 125.420' : 'R$ •••••••'}
               </p>
               <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                 <div className="bg-neon-green h-full w-[75%]"></div>
               </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map as MapIcon, Lock, CircleCheck, ShieldCheck, BrainCircuit, 
  Activity, Crosshair, HeartHandshake, Star, Zap, Gem, 
  Trophy, Target, UserCheck, Clock, Flame, Crown
} from 'lucide-react';
import { TRADER_MAP_LEVELS, ACHIEVEMENTS, MOCK_USER_PROGRESS, MOCK_MINDSET_HISTORY, CONSISTENCY_LEVELS } from '../constants';
import { MapLevel, Achievement, ConsistencyLevel, UserAccount } from '../types';
import UpgradeModal from '../components/UpgradeModal';

// Map string icon names to components
const ICON_MAP: Record<string, React.ElementType> = {
  BrainCircuit, Glasses: Activity, Crosshair, ShieldCheck, Zap, 
  Activity, Swords: Activity, HeartHandshake, Star, Gem,
  Shield: ShieldCheck, Target, UserCheck, Clock
};

const TraderMap = () => {
  const [selectedNode, setSelectedNode] = useState<MapLevel | null>(null);
  const [userProgress, setUserProgress] = useState(MOCK_USER_PROGRESS);
  const [consistencyStreak, setConsistencyStreak] = useState(0);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Check Plan
  const userString = localStorage.getItem('protrader_user');
  const user: UserAccount = userString ? JSON.parse(userString) : {};
  const isBasic = user.plan === 'BASIC';

  // Helper to get Icon component
  const getIcon = (name: string) => ICON_MAP[name] || Star;

  // Logic to calculate streak based on Mindset History
  useEffect(() => {
    const calculateStreak = () => {
      // Sort history by date descending (newest first)
      const sortedHistory = [...MOCK_MINDSET_HISTORY].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      let streak = 0;
      for (const entry of sortedHistory) {
        const isDisciplined = entry.disciplineScore >= 90;
        const noImpulse = entry.impulsiveTrades === 0;
        const noBadHabits = entry.badHabits.length === 0;
        const followedPlan = entry.executedTrades <= entry.plannedTrades;

        if (isDisciplined && noImpulse && noBadHabits && followedPlan) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
      setConsistencyStreak(streak);
    };

    calculateStreak();
  }, []);

  // Determine Current Consistency Level
  const currentConsistencyLevel = useMemo(() => {
    const levelsReversed = [...CONSISTENCY_LEVELS].reverse();
    const found = levelsReversed.find(lvl => consistencyStreak >= lvl.daysRequired);
    return found || { level: 0, name: 'INICIANTE', daysRequired: 0, color: 'text-slate-500', iconName: 'Target', description: 'Comece sua jornada.' };
  }, [consistencyStreak]);

  const nextConsistencyLevel = useMemo(() => {
     return CONSISTENCY_LEVELS.find(lvl => lvl.daysRequired > consistencyStreak);
  }, [consistencyStreak]);

  const isTreasureUnlocked = consistencyStreak >= 30;

  // Handler for locked interaction
  const handleLockedInteraction = () => {
     if (isBasic) setIsUpgradeModalOpen(true);
  };

  return (
    <div className="relative min-h-screen pb-20">
      
      {/* BASIC PLAN LOCK OVERLAY */}
      {isBasic && (
         <div className="absolute inset-0 z-30 backdrop-blur-sm bg-slate-950/70 flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
               <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-slate-800">
                  <Lock className="w-10 h-10 text-slate-500" />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Recurso Premium</h2>
               <p className="text-slate-400 mb-6">
                  O Mapa Trader Gamificado, com trilhas de evolução e conquistas, é exclusivo para assinantes.
               </p>
               <button 
                 onClick={() => setIsUpgradeModalOpen(true)}
                 className="px-8 py-3 bg-neon-cyan hover:bg-cyan-600 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-neon-cyan/20 flex items-center justify-center gap-2 mx-auto"
               >
                 <Crown className="w-5 h-5 fill-slate-900" /> Desbloquear Agora
               </button>
            </div>
         </div>
      )}

      {/* Upgrade Modal Component */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName="Mapa Trader & Gamificação" 
      />

      {/* HEADER & STATUS BAR */}
      <div className={`bg-slate-900 border-b border-slate-800 sticky top-0 z-20 -mx-8 px-8 py-4 shadow-lg backdrop-blur-md bg-slate-900/90 ${isBasic ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] border-2 border-white/20">
                {userProgress.currentLevel}
             </div>
             <div>
                <h1 className="text-white font-bold text-lg leading-tight">{userProgress.title}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                   <span>Nível {userProgress.currentLevel}</span>
                   <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                   <span className="text-neon-green font-bold">{userProgress.totalXP} XP Total</span>
                </div>
             </div>
          </div>

          <div className="w-full md:w-1/3">
             <div className="flex justify-between text-xs text-slate-400 mb-1 uppercase font-bold">
                <span>Progresso da Fase Atual</span>
                <span>{userProgress.totalXP} / {userProgress.nextLevelXP} XP</span>
             </div>
             <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-neon-green to-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: `${(userProgress.totalXP / userProgress.nextLevelXP) * 100}%` }}
                ></div>
             </div>
          </div>

        </div>
      </div>

      <div className={`max-w-6xl mx-auto mt-8 flex flex-col lg:flex-row gap-8 ${isBasic ? 'blur-sm pointer-events-none' : ''}`}>
        
        {/* LEFT: THE MAP (Visual Journey) */}
        <div className="flex-1 relative px-4">
           
           <div className="absolute left-8 md:left-1/2 top-10 bottom-10 w-1 border-l-2 border-dashed border-slate-700 -ml-[1px] z-0"></div>

           <div className="space-y-12 relative z-10 py-8">
              {TRADER_MAP_LEVELS.map((level, index) => {
                const Icon = getIcon(level.iconName);
                const isLeft = index % 2 === 0;
                const isLocked = level.status === 'LOCKED';
                const isActive = level.status === 'ACTIVE';
                const isCompleted = level.status === 'COMPLETED';

                return (
                  <div 
                    key={level.id} 
                    className={`flex flex-col md:flex-row items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className={`hidden md:block w-1/2 px-8 ${isLeft ? 'text-right' : 'text-left'}`}>
                       <h3 className={`font-bold text-lg ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                         {level.title}
                       </h3>
                       <p className="text-sm text-slate-500">{level.description}</p>
                    </div>

                    <div className="relative group">
                       {isActive && (
                         <div className="absolute inset-0 bg-neon-cyan/30 rounded-full animate-ping"></div>
                       )}
                       
                       <button
                         onClick={() => setSelectedNode(level)}
                         className={`w-16 h-16 rounded-full border-4 flex items-center justify-center relative z-20 transition-all duration-300 shadow-xl ${
                           isCompleted 
                             ? 'bg-slate-900 border-neon-green text-neon-green hover:bg-neon-green hover:text-slate-950' 
                             : isActive
                               ? 'bg-slate-900 border-neon-cyan text-neon-cyan hover:scale-110'
                               : 'bg-slate-900 border-slate-700 text-slate-700 cursor-not-allowed'
                         }`}
                       >
                          {isLocked ? <Lock className="w-6 h-6" /> : <Icon className="w-7 h-7" />}
                          
                          {isCompleted && (
                            <div className="absolute -right-1 -bottom-1 bg-slate-950 rounded-full">
                               <CircleCheck className="w-6 h-6 text-neon-green fill-slate-900" />
                            </div>
                          )}
                       </button>
                    </div>

                    <div className={`md:hidden pl-20 -mt-12 mb-4 w-full`}>
                       <h3 className={`font-bold text-lg ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                         {level.title}
                       </h3>
                    </div>
                    <div className="hidden md:block w-1/2"></div>
                  </div>
                );
              })}

              <div className="flex flex-col items-center mt-12 pt-8">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-b from-yellow-400 to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] border-4 border-yellow-300 relative z-20 animate-bounce-slow">
                    <Gem className="w-12 h-12 text-slate-900" />
                 </div>
                 <div className="mt-4 text-center bg-slate-900/80 backdrop-blur border border-yellow-500/30 p-4 rounded-xl relative z-10">
                    <h2 className="text-yellow-500 font-bold text-xl uppercase tracking-widest">Consistência</h2>
                    <p className="text-slate-400 text-sm">O objetivo final do Trader Profissional</p>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT: SIDEBAR / DETAILS PANEL */}
        <div className="w-full lg:w-80 space-y-6">
           <div className={`border rounded-xl p-6 overflow-hidden relative ${isTreasureUnlocked ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'bg-slate-900 border-slate-800'}`}>
              
              {isTreasureUnlocked && (
                <div className="absolute top-0 right-0 p-4 opacity-20">
                   <Gem size={100} className="text-yellow-500 animate-pulse" />
                </div>
              )}

              <div className="relative z-10">
                <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                   <Flame className={`w-5 h-5 ${isTreasureUnlocked ? 'text-yellow-500' : 'text-orange-500'}`} />
                   Evolução da Consistência
                </h3>
                <p className="text-xs text-slate-500 mb-4">Dias consecutivos seguindo 100% do plano.</p>
                
                <div className="flex items-center gap-3 mb-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                   <div className={`p-2 rounded-full ${currentConsistencyLevel.level > 0 ? 'bg-slate-800' : 'bg-slate-900'}`}>
                     {React.createElement(getIcon(currentConsistencyLevel.iconName), { className: `w-6 h-6 ${currentConsistencyLevel.color}` })}
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nível Atual</p>
                      <p className={`font-bold text-sm ${currentConsistencyLevel.color}`}>
                        {currentConsistencyLevel.name}
                      </p>
                   </div>
                </div>

                <div className="mb-2 flex justify-between text-xs font-bold">
                  <span className="text-white">{consistencyStreak} Dias</span>
                  <span className="text-slate-500">Meta: 30 Dias</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mb-4 relative">
                  <div 
                     className={`h-full transition-all duration-1000 ease-out ${isTreasureUnlocked ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-neon-cyan'}`}
                     style={{ width: `${Math.min(100, (consistencyStreak / 30) * 100)}%` }}
                  ></div>
                </div>
              </div>
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              {selectedNode ? (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${selectedNode.status === 'LOCKED' ? 'bg-slate-800 text-slate-500' : 'bg-neon-cyan/10 text-neon-cyan'}`}>
                        {React.createElement(getIcon(selectedNode.iconName), { className: 'w-6 h-6' })}
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-tight">{selectedNode.title}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          selectedNode.status === 'COMPLETED' ? 'bg-neon-green/20 text-neon-green' :
                          selectedNode.status === 'ACTIVE' ? 'bg-neon-cyan/20 text-neon-cyan' :
                          'bg-slate-800 text-slate-500'
                        }`}>
                          {selectedNode.status === 'COMPLETED' ? 'CONCLUÍDO' : selectedNode.status === 'ACTIVE' ? 'EM ANDAMENTO' : 'BLOQUEADO'}
                        </span>
                      </div>
                   </div>
                   
                   <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                     {selectedNode.description}
                   </p>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">
                   <MapIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                   <p className="text-sm">Clique em uma fase do mapa para ver os detalhes e objetivos.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TraderMap;

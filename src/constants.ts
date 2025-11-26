
import { Trade, TradeType, TradeStatus, Strategy, StrategyFolder, Investment, BrokerageNote, JournalSection, TaxRecord, MindsetEntry, EmotionType, MapLevel, Achievement, UserProgress, ConsistencyLevel, UserAccount } from './types';

// Helper to generate default journal structure
export const generateDefaultJournal = (overrides: Partial<any> = {}): JournalSection[] => [
  {
    id: 'timeframes',
    title: 'Time Frames & Contexto',
    isExpanded: true,
    fields: [
      { 
        id: 'tf_entry', 
        label: 'Time Frame de Entrada', 
        type: 'select', 
        value: overrides.tfEntry || '5m',
        options: [
          { id: '1', label: '1m' }, { id: '2', label: '5m' }, { id: '3', label: '15m' }, 
          { id: '4', label: '60m' }, { id: '5', label: 'Diário' }
        ]
      },
      { 
        id: 'tf_analysis', 
        label: 'Time Frame Analisado', 
        type: 'select', 
        value: overrides.tfAnalysis || '60m',
        options: [
          { id: '1', label: '15m' }, { id: '2', label: '60m' }, { id: '3', label: '4h' }, 
          { id: '4', label: 'Diário' }, { id: '5', label: 'Semanal' }
        ]
      }
    ]
  },
  {
    id: 'indicators',
    title: 'Indicadores Técnicos',
    isExpanded: false,
    fields: [
      {
        id: 'ma200',
        label: 'Médias de 200 Períodos',
        type: 'radio',
        value: overrides.ma200 || 'Neutral',
        options: [
          { id: '1', label: 'A favor da tendência' },
          { id: '2', label: 'Contra a tendência' },
          { id: '3', label: 'Flat / Lateral' }
        ]
      },
      {
        id: 'macd',
        label: 'MACD',
        type: 'radio',
        value: overrides.macd || 'Neutral',
        options: [
          { id: '1', label: 'Dois MACDs a favor' },
          { id: '2', label: 'Um MACD a favor' },
          { id: '3', label: 'Nenhum a favor' }
        ]
      }
    ]
  },
  {
    id: 'strategy',
    title: 'Estratégia Utilizada',
    isExpanded: true,
    fields: [
      {
        id: 'strategies_check',
        label: 'Setups Identificados',
        type: 'checklist',
        value: null,
        options: [
          { id: '1', label: 'Pullback nas Médias', checked: overrides.strategies?.includes('Pullback') || false },
          { id: '2', label: 'Ondas de Elliott', checked: false },
          { id: '3', label: 'Retração de Fibonacci', checked: false },
          { id: '4', label: 'Rompimento de Topo/Fundo', checked: overrides.strategies?.includes('Rompimento') || false },
          { id: '5', label: 'Suporte e Resistência', checked: false }
        ]
      }
    ]
  },
  {
    id: 'risk',
    title: 'Gestão de Risco',
    isExpanded: false,
    fields: [
      {
        id: 'rr',
        label: 'Risco x Retorno Planejado',
        type: 'select',
        value: overrides.rr || '2:1',
        options: [
          { id: '1', label: '1:1' }, { id: '2', label: '1.5:1' }, { id: '3', label: '2:1' }, 
          { id: '4', label: '3:1' }, { id: '5', label: '5:1+' }
        ]
      },
      {
        id: 'target',
        label: 'Preço Alvo (Target)',
        type: 'text',
        value: overrides.target || '',
        placeholder: 'Ex: 125.500'
      },
      {
        id: 'followed_system',
        label: 'Seguiu o Trade System?',
        type: 'boolean',
        value: true
      }
    ]
  },
  {
    id: 'psychology',
    title: 'Estado Emocional',
    isExpanded: false,
    fields: [
      {
        id: 'emotions',
        label: 'Sentimentos no momento do trade',
        type: 'checklist',
        value: null,
        options: [
          { id: '1', label: 'Disciplinado', checked: overrides.emotion === 'Calmo' },
          { id: '2', label: 'Confiante', checked: overrides.emotion === 'Confiante' },
          { id: '3', label: 'Ansioso', checked: overrides.emotion === 'Ansioso' },
          { id: '4', label: 'Medo', checked: false },
          { id: '5', label: 'Ganância / FOMO', checked: overrides.emotion === 'FOMO' },
          { id: '6', label: 'Raiva / Vingança', checked: false }
        ]
      }
    ]
  },
  {
    id: 'review',
    title: 'Autoavaliação',
    isExpanded: false,
    fields: [
      {
        id: 'mistakes',
        label: 'O que fiz de errado?',
        type: 'text',
        value: overrides.notes || '',
        placeholder: 'Descreva erros técnicos ou comportamentais...'
      },
      {
        id: 'lessons',
        label: 'Lição aprendida / Observações',
        type: 'text',
        value: '',
        placeholder: 'O que levar para o próximo trade...'
      }
    ]
  },
  {
    id: 'media',
    title: 'Mídia & Gráficos',
    isExpanded: true,
    fields: [
      {
        id: 'chart_img',
        label: 'Print da Operação',
        type: 'image',
        value: overrides.imageUrl || 'https://picsum.photos/600/400?grayscale',
      }
    ]
  }
];

export const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    date: '2024-05-10',
    asset: 'WINM24',
    type: TradeType.BUY,
    status: TradeStatus.CLOSED,
    quantity: 5,
    entryPrice: 125000,
    exitPrice: 125300,
    pnl: 300,
    strategy: 'Pullback M5',
    journal: generateDefaultJournal({ 
      tfEntry: '5m', 
      tfAnalysis: '60m', 
      strategies: ['Pullback'], 
      ma200: 'A favor da tendência',
      rr: '2:1',
      emotion: 'Calmo',
      notes: 'Entrada técnica perfeita. Saída parcial no topo.',
      imageUrl: 'https://picsum.photos/600/400?random=1'
    })
  },
  {
    id: '2',
    date: '2024-05-11',
    asset: 'WDOM24',
    type: TradeType.SELL,
    status: TradeStatus.CLOSED,
    quantity: 2,
    entryPrice: 5100,
    exitPrice: 5110,
    pnl: -200,
    strategy: 'Rompimento',
    journal: generateDefaultJournal({ 
      tfEntry: '5m', 
      tfAnalysis: '15m', 
      strategies: ['Rompimento'], 
      ma200: 'Contra a tendência',
      rr: '1:1',
      emotion: 'Ansioso',
      notes: 'Entrei antecipado sem confirmação de volume.',
      imageUrl: 'https://picsum.photos/600/400?random=2'
    })
  },
  {
    id: '3',
    date: '2024-05-12',
    asset: 'PETR4',
    type: TradeType.BUY,
    status: TradeStatus.OPEN,
    quantity: 500,
    entryPrice: 38.50,
    strategy: 'Swing Trade',
    journal: generateDefaultJournal({ 
      tfEntry: '60m', 
      tfAnalysis: 'Diário', 
      strategies: ['Suporte e Resistência'], 
      ma200: 'A favor da tendência',
      rr: '3:1',
      emotion: 'Confiante',
      notes: 'Aguardando alvo em 42.00.',
      imageUrl: 'https://picsum.photos/600/400?random=3'
    })
  }
];

export const MOCK_FOLDERS: StrategyFolder[] = [
  { id: '1', name: 'Método Palex' },
  { id: '2', name: 'Renko Pro' },
  { id: '3', name: 'Price Action Puro' },
];

export const MOCK_STRATEGIES: Strategy[] = [
  {
    id: '1',
    folderId: '1', // Palex
    name: 'Setup 9.1 (Larry Williams)',
    description: 'Estratégia de tendência utilizando a média móvel exponencial de 9 períodos.',
    timeframes: ['5m', '15m', 'Diário'],
    entryCriteria: ['MME9 virou para cima', 'Rompimento da máxima do candle que virou a média'],
    exitCriteria: ['MME9 virou para baixo', 'Perda da mínima do candle que virou a média'],
    imageUrl: 'https://picsum.photos/300/180?random=4',
    winRate: 68,
    customFields: [
      { id: '1', label: 'Autor', value: 'Larry Williams' },
      { id: '2', label: 'Indicador Chave', value: 'MME 9' }
    ]
  },
  {
    id: '2',
    folderId: '3', // Price Action Puro
    name: 'Trap de Rompimento',
    description: 'Operar contra o rompimento de topos ou fundos importantes quando não há confirmação de volume.',
    timeframes: ['15m', '60m'],
    entryCriteria: ['Rompimento de nível chave', 'Retorno rápido para dentro da zona', 'Volume baixo no rompimento'],
    exitCriteria: ['Fundo/Topo oposto do range'],
    imageUrl: 'https://picsum.photos/300/180?random=5',
    winRate: 55,
    customFields: [
       { id: '1', label: 'Tipo de Mercado', value: 'Lateral' },
       { id: '2', label: 'Fonte', value: 'Livro: Trading in the Zone' }
    ]
  },
  {
    id: '3',
    folderId: '2', // Renko
    name: 'Virada de Box (VB)',
    description: 'Operação a favor da tendência quando o box de Renko muda de cor.',
    timeframes: ['10R', '15R'],
    entryCriteria: ['Box fechou contra o movimento anterior', 'Média de 21 inclinada a favor'],
    exitCriteria: ['Box contrário fechar'],
    imageUrl: 'https://picsum.photos/300/180?random=6',
    winRate: 72,
    customFields: [
       { id: '1', label: 'Renko', value: 'Sim' }
    ]
  }
];

export const MOCK_INVESTMENTS: Investment[] = [
  { id: '1', asset: 'VALE3', type: 'Ações', quantity: 200, avgPrice: 65.00, currentPrice: 68.50, totalValue: 13700, profitability: 5.38 },
  { id: '2', asset: 'HGLG11', type: 'FIIs', quantity: 50, avgPrice: 160.00, currentPrice: 164.20, totalValue: 8210, profitability: 2.62 },
  { id: '3', asset: 'IVVB11', type: 'ETFs', quantity: 100, avgPrice: 280.00, currentPrice: 295.00, totalValue: 29500, profitability: 5.35 },
  { id: '4', asset: 'BTC', type: 'Cripto', quantity: 0.05, avgPrice: 320000, currentPrice: 350000, totalValue: 17500, profitability: 9.37 },
];

export const MOCK_BROKERAGE_NOTES: BrokerageNote[] = [
  { id: '1', date: '2024-05-10', totalOperations: 10, costs: 45.50, irrf: 2.50, netResult: 1250.00, fileName: 'Nota_10_05.pdf' },
  { id: '2', date: '2024-05-11', totalOperations: 4, costs: 12.00, irrf: 0, netResult: -450.00, fileName: 'Nota_11_05.pdf' },
];

export const MOCK_TAX_RECORDS: TaxRecord[] = [
  {
    id: '1',
    month: 'Março/2024',
    grossProfit: -2500.00,
    totalCosts: 150.00,
    irrf: 0.00,
    accumulatedLoss: 0.00,
    taxableBasis: 0.00,
    taxRate: 0.20,
    taxDue: 0.00,
    darfValue: 0.00,
    status: 'CREDIT'
  },
  {
    id: '2',
    month: 'Abril/2024',
    grossProfit: 5000.00,
    totalCosts: 200.00,
    irrf: 5.00,
    accumulatedLoss: 2650.00, // Loss from March (2500 + 150 costs)
    taxableBasis: 2145.00, // 5000 - 200 - 2650
    taxRate: 0.20,
    taxDue: 429.00,
    darfValue: 424.00, // 429 - 5 IRRF
    status: 'PAID'
  },
  {
    id: '3',
    month: 'Maio/2024',
    grossProfit: 3500.00,
    totalCosts: 120.00,
    irrf: 3.50,
    accumulatedLoss: 0.00,
    taxableBasis: 3380.00,
    taxRate: 0.20,
    taxDue: 676.00,
    darfValue: 672.50,
    status: 'PENDING'
  }
];

export const KPI_STATS = {
  winRate: 65.4,
  riskReturn: 2.1,
  totalTrades: 142,
  totalPnL: 12450.00
};

// --- MINDSET MOCK DATA (Generator) ---

const generateMockMindsetHistory = (): MindsetEntry[] => {
  const entries: MindsetEntry[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // Current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const emotions: EmotionType[] = ['Calmo', 'Confiante', 'Ansioso', 'Medo', 'Raiva', 'Ganância/FOMO', 'Entediado'];
  
  // Helper to adjust date for consistent streak simulation
  // We want to simulate a streak of ~12 days for the demo
  
  for (let day = 1; day <= daysInMonth; day++) {
    // Simulate randomness but with some consistency for "trends"
    const seed = day * 137; 
    let scoreBase = 40 + (seed % 60);
    
    // FORCE GOOD STREAK for the last 12 days to demo the feature
    const isRecent = day > (new Date().getDate() - 12);
    const isBadDay = isRecent ? false : scoreBase < 60;
    
    if (isRecent) {
      scoreBase = 90 + (seed % 10);
    }
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    entries.push({
      id: `mock-${day}`,
      date: dateStr,
      emotionPre: emotions[seed % 3], // calmer start usually
      emotionDuring: isBadDay ? emotions[3 + (seed % 3)] : emotions[seed % 2],
      emotionPost: isBadDay ? 'Raiva' : 'Confiante',
      dominantEmotion: isBadDay ? (seed % 2 === 0 ? 'Raiva' : 'Medo') : (seed % 2 === 0 ? 'Calmo' : 'Confiante'),
      clarityLevel: isBadDay ? 3 : 8,
      stressLevel: isBadDay ? 8 : 3,
      sleptWell: !isBadDay,
      observations: isBadDay ? 'Dia difícil, perdi o controle no meio da sessão.' : 'Segui o plano perfeitamente.',
      goodHabits: isBadDay ? ['Dormi bem'] : ['Dormi bem', 'Revisei o plano', 'Respeitei o stop'],
      badHabits: isBadDay ? ['Overtrading', 'Revenge trade'] : [],
      disciplineScore: scoreBase,
      plannedTrades: 4,
      executedTrades: isBadDay ? 8 + (seed % 5) : 3 + (seed % 2),
      impulsiveTrades: isBadDay ? 4 : 0,
      sabotagePatterns: isBadDay ? ['FOMO', 'Revenge trade'] : [],
      reflectionError: isBadDay ? 'Não aceitei o primeiro stop.' : '',
      reflectionCorrection: isBadDay ? 'Parar mais cedo.' : ''
    });
  }
  return entries;
};

export const MOCK_MINDSET_HISTORY: MindsetEntry[] = generateMockMindsetHistory();

// --- TRADER MAP (GAMIFICATION) MOCK DATA ---

export const CONSISTENCY_LEVELS: ConsistencyLevel[] = [
  { level: 1, name: 'FOCO', daysRequired: 7, iconName: 'Target', color: 'text-blue-400', description: 'Atenção consciente e início da disciplina.' },
  { level: 2, name: 'DISCIPLINA', daysRequired: 14, iconName: 'Shield', color: 'text-neon-green', description: 'Fortalecimento de rotinas e controle.' },
  { level: 3, name: 'PRECISÃO', daysRequired: 21, iconName: 'Crosshair', color: 'text-purple-500', description: 'Foco, clareza e assertividade.' },
  { level: 4, name: 'ELITE', daysRequired: 27, iconName: 'Star', color: 'text-orange-500', description: 'Domínio técnico e emocional.' },
  { level: 5, name: 'CONSISTÊNCIA ABSOLUTA', daysRequired: 30, iconName: 'Gem', color: 'text-neon-cyan', description: 'O nível máximo de maestria.' },
];

export const TRADER_MAP_LEVELS: MapLevel[] = [
  {
    id: 'lvl_1',
    title: 'Autoconhecimento',
    description: 'O início da jornada. Entenda seu perfil e preencha os dados iniciais.',
    xpReward: 50,
    order: 1,
    iconName: 'BrainCircuit',
    criteria: ['Preencher perfil de trader', 'Registrar primeiro diário de Mindset'],
    status: 'COMPLETED'
  },
  {
    id: 'lvl_2',
    title: 'Leitura de Mercado',
    description: 'Identifique tendências e padrões antes de operar.',
    xpReward: 80,
    order: 2,
    iconName: 'Glasses',
    criteria: ['Registrar 5 trades com contexto técnico', 'Acertar direção em 3 trades seguidos'],
    status: 'COMPLETED'
  },
  {
    id: 'lvl_3',
    title: 'Setup Dominado',
    description: 'Execute apenas o que você planejou, sem invenções.',
    xpReward: 120,
    order: 3,
    iconName: 'Crosshair',
    criteria: ['10 Trades seguindo a estratégia', 'Documentar gatilhos em todos os trades'],
    status: 'COMPLETED'
  },
  {
    id: 'lvl_4',
    title: 'Gerenciamento de Risco',
    description: 'A sobrevivência é a chave. Proteja seu capital.',
    xpReward: 200,
    order: 4,
    iconName: 'ShieldCheck',
    criteria: ['Respeitar Stop Loss em 10 operações seguidas', 'Risco x Retorno médio > 1.5'],
    status: 'ACTIVE'
  },
  {
    id: 'lvl_5',
    title: 'Mindset Diário',
    description: 'A consistência mental gera consistência financeira.',
    xpReward: 150,
    order: 5,
    iconName: 'Zap',
    criteria: ['Preencher Mindset por 5 dias consecutivos'],
    status: 'LOCKED'
  },
  {
    id: 'lvl_6',
    title: 'Disciplina Operacional',
    description: 'Controle seus impulsos. Qualidade sobre quantidade.',
    xpReward: 300,
    order: 6,
    iconName: 'Activity',
    criteria: ['3 dias sem Overtrading', 'Score de disciplina > 80% por 3 dias'],
    status: 'LOCKED'
  },
  {
    id: 'lvl_7',
    title: 'Execução Técnica',
    description: 'Precisão cirúrgica nas entradas e saídas.',
    xpReward: 500,
    order: 7,
    iconName: 'Swords',
    criteria: ['20 Trades 100% dentro do plano', 'Winrate acima de 50% em 20 trades'],
    status: 'LOCKED'
  },
  {
    id: 'lvl_8',
    title: 'Controle Emocional',
    description: 'Domine o FOMO e a ganância.',
    xpReward: 300,
    order: 8,
    iconName: 'HeartHandshake',
    criteria: ['Zero registros de Revenge Trade no mês', 'Zero registros de FOMO no mês'],
    status: 'LOCKED'
  },
  {
    id: 'lvl_9',
    title: 'Semana Perfeita',
    description: 'O auge da performance semanal.',
    xpReward: 600,
    order: 9,
    iconName: 'Star',
    criteria: ['Semana com disciplina > 85%', 'Sem dias negativos por descontrole'],
    status: 'LOCKED'
  },
  {
    id: 'lvl_10',
    title: 'O Baú da Consistência',
    description: 'A conquista máxima. Você se tornou um profissional.',
    xpReward: 1000,
    order: 10,
    iconName: 'Gem',
    criteria: ['Completar todas as fases anteriores', '3 meses de fechamento positivo'],
    status: 'LOCKED',
    isTreasure: true
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_1', title: 'Mago do Gerenciamento', description: 'Nunca moveu o stop loss em 50 trades.', iconName: 'Shield', unlocked: true, dateUnlocked: '2024-04-15' },
  { id: 'ach_2', title: 'Caçador de Setups', description: 'Identificou 50 padrões gráficos corretamente.', iconName: 'Target', unlocked: true, dateUnlocked: '2024-04-20' },
  { id: 'ach_3', title: 'Monge do Mindset', description: 'Manteve a calma em dias de loss por 1 mês.', iconName: 'UserCheck', unlocked: false },
  { id: 'ach_4', title: 'Executor Perfeito', description: 'Errou zero execuções na semana.', iconName: 'Zap', unlocked: false },
  { id: 'ach_5', title: 'Anti-FOMO', description: 'Não operou na abertura (9:00-9:15) por 1 mês.', iconName: 'Clock', unlocked: false },
];

export const MOCK_USER_PROGRESS: UserProgress = {
  currentLevel: 4,
  totalXP: 480,
  nextLevelXP: 680, // Needs 200 more for level 4 completion
  title: 'Trader em Evolução',
  currentStreak: 12 // Will be updated by logic, but default here
};

// --- MOCK USERS FOR ADMIN PANEL ---

export const MOCK_USERS: UserAccount[] = [
  {
    id: 'u1',
    name: 'Carlos Oliveira',
    email: 'carlos.trader@email.com',
    role: 'USER',
    status: 'ACTIVE',
    plan: 'PREMIUM',
    joinDate: '2024-01-10',
    currentConsistencyLevel: 'ELITE',
    streak: 28,
    avgDiscipline: 92,
    lastLogin: '2024-05-18 09:30'
  },
  {
    id: 'u2',
    name: 'Fernanda Lima',
    email: 'fernanda.l@email.com',
    role: 'USER',
    status: 'ACTIVE',
    plan: 'BASIC',
    joinDate: '2024-03-22',
    currentConsistencyLevel: 'DISCIPLINA',
    streak: 15,
    avgDiscipline: 78,
    lastLogin: '2024-05-17 18:45'
  },
  {
    id: 'u3',
    name: 'João Silva',
    email: 'joaosilva@exemplo.com',
    role: 'USER',
    status: 'ACTIVE',
    plan: 'BASIC',
    joinDate: '2024-05-18',
    currentConsistencyLevel: 'FOCO',
    streak: 0,
    avgDiscipline: 0,
    lastLogin: '-'
  },
  {
    id: 'u4',
    name: 'Mariana Torres',
    email: 'marianatorres@exemplo.com',
    role: 'USER',
    status: 'ACTIVE',
    plan: 'PREMIUM',
    joinDate: '2023-11-05',
    currentConsistencyLevel: 'ELITE',
    streak: 12,
    avgDiscipline: 95,
    lastLogin: '2024-04-10 10:00'
  },
  {
    id: 'u5',
    name: 'Admin Principal',
    email: 'admin@protrader.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    plan: 'PREMIUM',
    joinDate: '2023-01-01',
    currentConsistencyLevel: 'CONSISTÊNCIA ABSOLUTA',
    streak: 365,
    avgDiscipline: 100,
    lastLogin: '2024-05-19 08:00'
  }
];
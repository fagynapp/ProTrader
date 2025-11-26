
export enum TradeType {
  BUY = 'Compra',
  SELL = 'Venda',
}

export enum TradeStatus {
  OPEN = 'Aberto',
  CLOSED = 'Fechado',
  PENDING = 'Pendente'
}

export type FieldType = 'text' | 'select' | 'checklist' | 'radio' | 'image' | 'boolean';

export interface JournalOption {
  id: string;
  label: string;
  checked?: boolean; // For checklists
}

export interface JournalField {
  id: string;
  label: string;
  type: FieldType;
  value: any; // string, string[], boolean, etc.
  options?: JournalOption[]; // For select, checklist, radio
  placeholder?: string;
}

export interface JournalSection {
  id: string;
  title: string;
  isExpanded: boolean;
  fields: JournalField[];
}

export interface Trade {
  id: string;
  date: string;
  asset: string;
  type: TradeType;
  status: TradeStatus;
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  
  // Top level summary fields (kept for backward compatibility/table view)
  strategy: string;
  imageUrl?: string;
  
  // Detailed Flexible Journal
  journal: JournalSection[];
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export interface StrategyFolder {
  id: string;
  name: string;
}

export interface Strategy {
  id: string;
  folderId?: string; // Link to a StrategyFolder
  name: string;
  description: string;
  timeframes: string[];
  entryCriteria: string[];
  exitCriteria: string[];
  imageUrl: string;
  winRate?: number;
  customFields?: CustomField[]; // New flexible fields (Author, Course, Origin, etc.)
}

export interface Investment {
  id: string;
  asset: string;
  type: 'Ações' | 'FIIs' | 'ETFs' | 'Cripto' | 'Renda Fixa';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  profitability: number;
}

export interface BrokerageNote {
  id: string;
  date: string;
  totalOperations: number;
  costs: number;
  irrf: number;
  netResult: number;
  fileName: string;
}

export interface TaxRecord {
  id: string;
  month: string; // e.g., "Maio/2024"
  grossProfit: number; // Resultado Bruto
  totalCosts: number; // Taxas B3 + Corretagem
  irrf: number; // Dedo-duro retido
  accumulatedLoss: number; // Prejuízo de meses anteriores para abater
  taxableBasis: number; // Base de cálculo final
  taxRate: number; // 20% (DT) ou 15% (ST)
  taxDue: number; // Imposto Devido
  darfValue: number; // Valor final da DARF (Imposto Devido - IRRF)
  status: 'PAID' | 'PENDING' | 'CREDIT'; // Pago, Pendente ou Crédito (Prejuízo)
}

// --- MINDSET TYPES ---

export type EmotionType = 'Calmo' | 'Confiante' | 'Ansioso' | 'Medo' | 'Raiva' | 'Ganância/FOMO' | 'Entediado' | 'Eufórico' | 'Neutro';

export interface MindsetEntry {
  id: string;
  date: string;
  
  // 1. Emoções
  emotionPre: EmotionType;
  emotionDuring: EmotionType;
  emotionPost: EmotionType;
  dominantEmotion: EmotionType;
  clarityLevel: number; // 0-10
  stressLevel: number; // 0-10
  sleptWell: boolean;
  observations: string;

  // 2. Hábitos
  goodHabits: string[]; // IDs or Labels of checked habits
  badHabits: string[];
  disciplineScore: number; // 0-100

  // 3. Overtrading
  plannedTrades: number;
  executedTrades: number;
  impulsiveTrades: number;
  lossControlTime?: string; // "10:42"

  // 4. Sabotagem
  sabotagePatterns: string[];
  reflectionError: string;
  reflectionCorrection: string;
}

// --- TRADER MAP (GAMIFICATION) TYPES ---

export type MapNodeStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED';

export interface MapLevel {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  order: number; // 1 to 12
  iconName: string; // String reference to Lucide icon
  criteria: string[]; // List of requirements to unlock
  status: MapNodeStatus;
  isTreasure?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  dateUnlocked?: string;
}

export interface UserProgress {
  currentLevel: number;
  totalXP: number;
  nextLevelXP: number;
  title: string; // e.g. "Trader Iniciante", "Trader Disciplinado"
  currentStreak: number; // Dias consecutivos de disciplina
}

export interface ConsistencyLevel {
  level: number;
  name: string;
  daysRequired: number;
  iconName: string;
  color: string;
  description: string;
}

// --- AUTH & ADMIN TYPES ---

export type UserRole = 'ADMIN' | 'USER';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';
export type UserPlan = 'BASIC' | 'PREMIUM';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  plan: UserPlan; // Added plan field
  joinDate: string;
  
  // Progress Data Snapshot
  currentConsistencyLevel: string; // e.g. "FOCO", "ELITE"
  streak: number;
  avgDiscipline: number;
  lastLogin: string;
}
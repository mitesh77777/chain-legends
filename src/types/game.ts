export interface Fighter {
  id: string;
  tokenId: string;
  name: string;
  element: Element;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  weaponId?: string;
  armorId?: string;
  lastBattle: number;
  owner: string;
  imageUrl: string;
}

export enum Element {
  FIRE = 0,
  WATER = 1,
  EARTH = 2,
  AIR = 3,
}

export enum BattleAction {
  ATTACK = 'attack',
  DEFEND = 'defend',
  SPECIAL = 'special',
  ITEM = 'item',
}

export interface Equipment {
  id: string;
  tokenId: string;
  name: string;
  type: EquipmentType;
  tier: EquipmentTier;
  element: Element;
  attackBonus?: number;
  defenseBonus?: number;
  healthBonus?: number;
  durability: number;
  maxDurability: number;
  experience: number;
  owner: string;
  imageUrl: string;
}

export enum EquipmentType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
}

export enum EquipmentTier {
  COMMON = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
}

export interface BattleState {
  id: string;
  player1: {
    fighter: Fighter;
    currentHealth: number;
    address: string;
  };
  player2: {
    fighter: Fighter;
    currentHealth: number;
    address: string;
  };
  currentTurn: 'player1' | 'player2';
  turnNumber: number;
  status: BattleStatus;
  actions: BattleActionRecord[];
  winner?: 'player1' | 'player2';
  createdAt: number;
  turnDeadline: number;
}

export enum BattleStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface BattleActionRecord {
  playerId: 'player1' | 'player2';
  action: BattleAction;
  damage?: number;
  effect?: string;
  timestamp: number;
}

export interface BattleResult {
  damage: number;
  critical: boolean;
  effect?: string;
  newHealth: number;
}

export interface Tournament {
  id: string;
  name: string;
  prizePool: string;
  status: TournamentStatus;
  maxParticipants: number;
  entryFee: string;
  startTime: number;
  bracket: TournamentBracket;
  participants: string[];
  winner?: string;
}

export enum TournamentStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export interface TournamentBracket {
  rounds: TournamentRound[];
  currentRound: number;
}

export interface TournamentRound {
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  player1?: string;
  player2?: string;
  winner?: string;
  status: 'pending' | 'active' | 'completed';
}

export interface Player {
  id: string;
  walletAddress: string;
  username?: string;
  fighterNftId?: string;
  totalWins: number;
  totalLosses: number;
  ranking: number;
  lastActive: number;
  createdAt: number;
}

export interface BattleRoom {
  id: string;
  player1Id?: string;
  player2Id?: string;
  status: 'waiting' | 'active' | 'completed';
  winnerId?: string;
  battleData?: BattleState;
  createdAt: number;
  completedAt?: number;
}

export interface ShareableContent {
  image: string;
  text: string;
  url: string;
  stats: {
    damage: number;
    turns: number;
    level: number;
  };
}
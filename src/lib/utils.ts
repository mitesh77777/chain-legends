import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function calculateLevel(experience: number): number {
  return Math.floor(experience / 100) + 1;
}

export function getExperienceForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

export function getElementColor(element: number): string {
  const colors = {
    0: 'text-red-500', // Fire
    1: 'text-blue-500', // Water
    2: 'text-green-500', // Earth
    3: 'text-gray-400', // Air
  };
  return colors[element as keyof typeof colors] || 'text-gray-500';
}

export function getElementName(element: number): string {
  const names = {
    0: 'Fire',
    1: 'Water', 
    2: 'Earth',
    3: 'Air',
  };
  return names[element as keyof typeof names] || 'Unknown';
}

export function getTierColor(tier: number): string {
  const colors = {
    0: 'text-gray-400', // Common
    1: 'text-blue-400', // Rare
    2: 'text-purple-400', // Epic
    3: 'text-yellow-400', // Legendary
  };
  return colors[tier as keyof typeof colors] || 'text-gray-500';
}

export function getTierName(tier: number): string {
  const names = {
    0: 'Common',
    1: 'Rare',
    2: 'Epic', 
    3: 'Legendary',
  };
  return names[tier as keyof typeof names] || 'Unknown';
}

export function generateRandomName(): string {
  const prefixes = [
    'Shadow', 'Storm', 'Fire', 'Ice', 'Thunder', 'Lightning', 'Dark', 'Light',
    'Iron', 'Steel', 'Dragon', 'Phoenix', 'Wolf', 'Eagle', 'Tiger', 'Lion'
  ];
  
  const suffixes = [
    'blade', 'fist', 'heart', 'soul', 'strike', 'fury', 'rage', 'storm',
    'guard', 'shield', 'claw', 'fang', 'wing', 'eye', 'spirit', 'warrior'
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}${suffix}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
'use client'

import { createThirdwebClient, getContract } from 'thirdweb'
import { prepareContractCall, sendTransaction, readContract } from 'thirdweb'
import { defineChain } from 'thirdweb/chains'
import type { Fighter, BattleResult } from '@/types/game'

// Etherlink Testnet configuration
export const etherlinkTestnet = defineChain({
  id: 128123,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpc: 'https://node.ghostnet.etherlink.com',
  blockExplorers: [
    {
      name: 'Etherlink Explorer',
      url: 'https://testnet.explorer.etherlink.com',
    },
  ],
})

// Initialize Thirdweb client
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || 'your-client-id',
})

// Contract addresses (deployed on Etherlink testnet)
export const CONTRACT_ADDRESSES = {
  FIGHTER_NFT: '0xC61CD717dF7e978E0F1C08b2634DfD1Bf94E2400',
  BATTLE_ARENA: '0x21abBdD8C2E875021b768F8E0f1510Dcd3c98B21',
  GAME_TOKEN: '0xd2f0EF429169508E9aaAE3128a6731A44F7603B4',
  TOURNAMENT: '0xf3F44f19A04d1e869eFB17430C4787Ec9819C657',
  DEPLOYER: '0xb2727c36F8b3fa7eBb179f38002C9561D9eAA9E3',
} as const

// Contract instances  
const fighterContract = getContract({
  client,
  chain: etherlinkTestnet,
  address: CONTRACT_ADDRESSES.FIGHTER_NFT,
})

const battleArenaContract = getContract({
  client,
  chain: etherlinkTestnet,
  address: CONTRACT_ADDRESSES.BATTLE_ARENA,
})

const gameTokenContract = getContract({
  client,
  chain: etherlinkTestnet,
  address: CONTRACT_ADDRESSES.GAME_TOKEN,
})

const tournamentContract = getContract({
  client,
  chain: etherlinkTestnet,
  address: CONTRACT_ADDRESSES.TOURNAMENT,
})

// Contract interaction functions (compatible with Thirdweb v5)

// Mint a new fighter NFT
export async function mintFighter(
  account: any,
  element: number,
  level: number,
  name: string,
  imageUrl: string
): Promise<string> {
  const transaction = prepareContractCall({
    contract: fighterContract,
    method: "function mintFighter(address to, uint256 element, uint256 level, string memory name, string memory imageUrl) payable returns (uint256)",
    params: [account.address, BigInt(element), BigInt(level), name, imageUrl],
    value: BigInt(0), // Add proper mint price calculation if needed
  })

  const result = await sendTransaction({
    transaction,
    account,
  })
  return result.transactionHash
}

// Get fighter info from smart contract
export async function getFighterInfo(tokenId: number) {
  const result = await readContract({
    contract: fighterContract,
    method: "function getFighterInfo(uint256 tokenId) view returns ((uint256 health, uint256 maxHealth, uint256 attack, uint256 defense, uint256 speed, uint256 level, uint8 element, uint256 experience, uint256 wins, uint256 losses, uint256 lastBattle, bool isActive), (string name, string description, string imageUrl, uint256 mintedAt, address originalOwner))",
    params: [BigInt(tokenId)],
  })

  return result
}

// Get all fighters owned by an address
export async function getPlayerFighters(address: string): Promise<Fighter[]> {
  try {
    // Get balance
    const balance = await readContract({
      contract: fighterContract,
      method: "function balanceOf(address owner) view returns (uint256)",
      params: [address],
    })

    const fighters: Fighter[] = []
    
    // Get each fighter
    for (let i = 0; i < Number(balance); i++) {
      const tokenId = await readContract({
        contract: fighterContract,
        method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
        params: [address, BigInt(i)],
      })

      const [stats, metadata] = await getFighterInfo(Number(tokenId))
      
      fighters.push({
        id: tokenId.toString(),
        tokenId: tokenId.toString(),
        name: metadata.name,
        level: Number(stats.level),
        health: Number(stats.health),
        maxHealth: Number(stats.maxHealth),
        attack: Number(stats.attack),
        defense: Number(stats.defense),
        speed: Number(stats.speed),
        element: stats.element,
        experience: Number(stats.experience),
        imageUrl: metadata.imageUrl,
        wins: Number(stats.wins),
        losses: Number(stats.losses),
        lastBattle: Number(stats.lastBattle),
        owner: address,
      })
    }

    return fighters
  } catch (error) {
    console.error('Error fetching fighters:', error)
    return []
  }
}

// Create a new battle
export async function createBattle(
  account: any,
  fighter1Id: number,
  fighter2Id: number,
  entryFee: number
): Promise<string> {
  const transaction = prepareContractCall({
    contract: battleArenaContract,
    method: "function createBattle(uint256 fighter1Id, uint256 fighter2Id, uint256 entryFee) returns (uint256)",
    params: [BigInt(fighter1Id), BigInt(fighter2Id), BigInt(entryFee)],
  })

  const result = await sendTransaction({
    transaction,
    account,
  })
  return result.transactionHash
}

// Submit battle results
export async function submitBattleResult(
  account: any,
  battleId: number,
  winnerId: number,
  loserId: number,
  battleDataHash: `0x${string}`
): Promise<string> {
  const transaction = prepareContractCall({
    contract: battleArenaContract,
    method: "function submitBattleResult(uint256 battleId, uint256 winnerId, uint256 loserId, bytes32 battleDataHash)",
    params: [BigInt(battleId), BigInt(winnerId), BigInt(loserId), battleDataHash],
  })

  const result = await sendTransaction({
    transaction,
    account,
  })
  return result.transactionHash
}

// Get battle details
export async function getBattle(battleId: number) {
  return await readContract({
    contract: battleArenaContract,
    method: "function getBattle(uint256 battleId) view returns ((uint256 id, address player1, address player2, uint256 fighter1Id, uint256 fighter2Id, uint256 winnerId, uint256 loserId, uint8 status, bytes32 battleDataHash, uint256 createdAt, uint256 completedAt, uint256 entryFee, bool rewardsClaimed))",
    params: [BigInt(battleId)],
  })
}

// Claim battle rewards
export async function claimBattleRewards(
  account: any,
  battleId: number
): Promise<string> {
  const transaction = prepareContractCall({
    contract: battleArenaContract,
    method: "function claimBattleRewards(uint256 battleId)",
    params: [BigInt(battleId)],
  })

  const result = await sendTransaction({
    transaction,
    account,
  })
  return result.transactionHash
}

// Get token balance
export async function getTokenBalance(address: string): Promise<number> {
  const balance = await readContract({
    contract: gameTokenContract,
    method: "function balanceOf(address account) view returns (uint256)",
    params: [address],
  })
  
  return Number(balance) / 10**18 // Convert from wei
}

// Transfer tokens
export async function transferTokens(
  account: any,
  to: string,
  amount: number
): Promise<string> {
  const transaction = prepareContractCall({
    contract: gameTokenContract,
    method: "function transfer(address to, uint256 amount) returns (bool)",
    params: [to, BigInt(amount * 10**18)], // Convert to wei
  })

  const result = await sendTransaction({
    transaction,
    account,
  })
  return result.transactionHash
}

// Battle utilities
export function generateBattleHash(battleData: any): `0x${string}` {
  // Simple hash generation for demo purposes
  const dataString = JSON.stringify(battleData)
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}` as `0x${string}`
}

// Battle event listeners (simplified for Thirdweb v5)
export function listenToBattleEvents(onEvent: (event: any) => void) {
  console.log('Battle event listening would be implemented here with Thirdweb v5 event system')
  // Note: Actual implementation would use Thirdweb v5 event system
  // For now, this is a placeholder
}

// Utility functions
export function getContractExplorerUrl(contractAddress: string): string {
  return `https://testnet.explorer.etherlink.com/address/${contractAddress}`
}

export function getTransactionExplorerUrl(txHash: string): string {
  return `https://testnet.explorer.etherlink.com/tx/${txHash}`
}

// Additional utility functions for UI components
export function formatTokenAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  }
  return num.toFixed(2)
}

export function getElementName(element: number): string {
  switch (element) {
    case 0: return 'Fire'
    case 1: return 'Water'
    case 2: return 'Earth'
    case 3: return 'Air'
    default: return 'Unknown'
  }
}

export function calculateMintCost(level: number): number {
  // Base cost calculation (can be adjusted based on your smart contract logic)
  return 0.1 * level
}

// Placeholder for ChainLegends compatibility
export const ChainLegends = {
  etherlinkTestnet,
  CONTRACT_ADDRESSES,
  client,
  // Add any other properties that were previously in ChainLegends
}

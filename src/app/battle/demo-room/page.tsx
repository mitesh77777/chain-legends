'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BattleArena } from '@/components/game/BattleArena'
import { Button } from '@/components/ui/button'
import { Fighter, Element, BattleAction, BattleState } from '@/types/game'
import { BattleEngine } from '@/lib/battle-engine'
import { generateRandomName, generateId } from '@/lib/utils'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default function DemoBattlePage() {
  const [playerFighter, setPlayerFighter] = useState<Fighter | null>(null)
  const [opponentFighter, setOpponentFighter] = useState<Fighter | null>(null)
  const [battleKey, setBattleKey] = useState(0) // For resetting battle

  useEffect(() => {
    generateFighters()
  }, [])

  const generateFighters = () => {
    // Generate player fighter
    const playerElement = Math.floor(Math.random() * 4) as Element
    const playerLevel = Math.floor(Math.random() * 3) + 1 // Level 1-3
    const playerStats = BattleEngine.generateFighterStats(playerElement, playerLevel)
    
    const player: Fighter = {
      id: generateId(),
      tokenId: '1',
      name: generateRandomName(),
      element: playerElement,
      level: playerLevel,
      experience: (playerLevel - 1) * 100,
      wins: Math.floor(Math.random() * 10),
      losses: Math.floor(Math.random() * 5),
      health: playerStats.health,
      maxHealth: playerStats.health,
      attack: playerStats.attack,
      defense: playerStats.defense,
      speed: playerStats.speed,
      lastBattle: Date.now(),
      owner: 'player',
      imageUrl: '/fighters/default.png'
    }

    // Generate opponent fighter (similar level)
    const opponentElement = Math.floor(Math.random() * 4) as Element
    const opponentLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1) // ±1 level
    const opponentStats = BattleEngine.generateFighterStats(opponentElement, opponentLevel)
    
    const opponent: Fighter = {
      id: generateId(),
      tokenId: '2',
      name: generateRandomName(),
      element: opponentElement,
      level: opponentLevel,
      experience: (opponentLevel - 1) * 100,
      wins: Math.floor(Math.random() * 10),
      losses: Math.floor(Math.random() * 5),
      health: opponentStats.health,
      maxHealth: opponentStats.health,
      attack: opponentStats.attack,
      defense: opponentStats.defense,
      speed: opponentStats.speed,
      lastBattle: Date.now(),
      owner: 'opponent',
      imageUrl: '/fighters/default.png'
    }

    setPlayerFighter(player)
    setOpponentFighter(opponent)
  }

  const handleBattleEnd = (winner: 'player1' | 'player2' | null, battleData: BattleState) => {
    console.log('Battle ended!', { winner, battleData })
    
    // In a real app, this would:
    // 1. Update player stats in database
    // 2. Award experience points
    // 3. Update NFT metadata
    // 4. Record battle in blockchain
    // 5. Update leaderboards
  }

  const handleResetBattle = () => {
    generateFighters()
    setBattleKey(prev => prev + 1) // Force re-render of BattleArena
  }

  if (!playerFighter || !opponentFighter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
        <span className="ml-3 text-lg">Preparing battle...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={handleResetBattle}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              New Battle
            </Button>
          </div>
        </div>

        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-500/30 rounded-lg p-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-400 mb-1">Demo Battle Mode</h3>
              <p className="text-sm text-yellow-200/80">
                This is a demonstration of the battle system. In the full game, you&apos;ll battle real players, 
                earn XP, level up your fighters, and compete in tournaments for prizes.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Battle Arena */}
        <BattleArena
          key={battleKey}
          roomId="demo-room-12345"
          playerFighter={playerFighter}
          opponentFighter={opponentFighter}
          isPlayerTurn={true}
          onBattleEnd={handleBattleEnd}
          onActionSubmit={(action: BattleAction) => {
            console.log('Player action:', action)
          }}
        />
      </div>

      {/* Instructions */}
      <div className="container mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Battle Actions</h4>
              <ul className="space-y-1">
                <li><strong>Attack (1):</strong> Deal damage to opponent</li>
                <li><strong>Defend (2):</strong> Reduce incoming damage</li>
                <li><strong>Special (3):</strong> Powerful elemental attack</li>
                <li><strong>Heal (4):</strong> Restore your health</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">Element System</h4>
              <ul className="space-y-1">
                <li><strong>Fire:</strong> Strong vs Earth, weak vs Water</li>
                <li><strong>Water:</strong> Strong vs Fire, weak vs Air</li>
                <li><strong>Earth:</strong> Strong vs Air, weak vs Fire</li>
                <li><strong>Air:</strong> Strong vs Water, weak vs Earth</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400">
            💡 Use keyboard shortcuts (1-4) for quick action selection!
          </div>
        </motion.div>
      </div>
    </div>
  )
}
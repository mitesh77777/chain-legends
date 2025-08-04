'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FighterCard } from '@/components/game/FighterCard'
import { Fighter, Element, BattleAction, BattleState, BattleStatus } from '@/types/game'
import { BattleEngine } from '@/lib/battle-engine'
import { BattleAI } from '@/lib/battle-ai'
import { generateRandomName, generateId } from '@/lib/utils'
import { Trophy, Users, Zap, Crown, Swords, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TournamentBracket {
  id: string
  round: number
  fighters: Fighter[]
  winner?: Fighter
  completed: boolean
}

export default function TournamentPage() {
  const [tournament, setTournament] = useState<{
    id: string
    name: string
    totalFighters: number
    currentRound: number
    maxRounds: number
    brackets: TournamentBracket[]
    champion?: Fighter
    playerFighter?: Fighter
    isPlayerEliminated: boolean
    completed: boolean
  } | null>(null)
  
  const [currentBattle, setCurrentBattle] = useState<{
    bracket: TournamentBracket
    fighter1: Fighter
    fighter2: Fighter
    battleState?: BattleState
  } | null>(null)

  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    generateTournament()
  }, [])

  const generateTournament = async () => {
    setIsGenerating(true)
    
    // Generate 8 fighters for tournament (including player)
    const fighters: Fighter[] = []
    
    // Generate player fighter
    const playerElement = Math.floor(Math.random() * 4) as Element
    const playerStats = BattleEngine.generateFighterStats(playerElement, 2)
    
    const playerFighter: Fighter = {
      id: generateId(),
      tokenId: 'player',
      name: 'Champion', // Player's fighter name
      element: playerElement,
      level: 2,
      experience: 150,
      wins: 5,
      losses: 1,
      health: playerStats.health,
      maxHealth: playerStats.health,
      attack: playerStats.attack,
      defense: playerStats.defense,
      speed: playerStats.speed,
      lastBattle: Date.now(),
      owner: 'player',
      imageUrl: '/fighters/player.png'
    }
    fighters.push(playerFighter)

    // Generate 7 AI opponents
    for (let i = 0; i < 7; i++) {
      const element = Math.floor(Math.random() * 4) as Element
      const level = Math.floor(Math.random() * 3) + 1 // Level 1-3
      const stats = BattleEngine.generateFighterStats(element, level)
      
      const aiFighter: Fighter = {
        id: generateId(),
        tokenId: `ai_${i}`,
        name: generateRandomName(),
        element,
        level,
        experience: (level - 1) * 100 + Math.floor(Math.random() * 50),
        wins: Math.floor(Math.random() * 15),
        losses: Math.floor(Math.random() * 8),
        health: stats.health,
        maxHealth: stats.health,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed,
        lastBattle: Date.now(),
        owner: 'ai',
        imageUrl: '/fighters/default.png'
      }
      fighters.push(aiFighter)
    }

    // Shuffle fighters for random bracket
    const shuffledFighters = [...fighters].sort(() => Math.random() - 0.5)
    
    // Create round 1 brackets (8 fighters -> 4 brackets)
    const round1Brackets: TournamentBracket[] = []
    for (let i = 0; i < shuffledFighters.length; i += 2) {
      round1Brackets.push({
        id: `round1_${i/2}`,
        round: 1,
        fighters: [shuffledFighters[i], shuffledFighters[i + 1]],
        completed: false
      })
    }

    const newTournament = {
      id: generateId(),
      name: 'Chain Legends Championship',
      totalFighters: 8,
      currentRound: 1,
      maxRounds: 3, // 8->4->2->1
      brackets: round1Brackets,
      playerFighter,
      isPlayerEliminated: false,
      completed: false
    }

    setTournament(newTournament)
    setIsGenerating(false)
  }

  const startBattle = (bracket: TournamentBracket) => {
    if (bracket.fighters.length !== 2 || bracket.completed) return

    setCurrentBattle({
      bracket,
      fighter1: bracket.fighters[0],
      fighter2: bracket.fighters[1]
    })
  }

  const simulateBattle = async (fighter1: Fighter, fighter2: Fighter): Promise<Fighter> => {
    // Quick simulation for AI vs AI battles
    let battle: BattleState = {
      id: generateId(),
      player1: { fighter: fighter1, currentHealth: fighter1.health, address: 'ai1' },
      player2: { fighter: fighter2, currentHealth: fighter2.health, address: 'ai2' },
      currentTurn: 'player1',
      turnNumber: 0,
      status: BattleStatus.ACTIVE,
      actions: [],
      createdAt: Date.now(),
      turnDeadline: Date.now() + 10000
    }

    // Simulate up to 20 turns
    while (battle.status === BattleStatus.ACTIVE && battle.turnNumber < 20) {
      const action1 = BattleAI.chooseAction(
        battle.player1.fighter,
        battle.player1.currentHealth,
        battle.player2.fighter,
        battle.player2.currentHealth,
        battle,
        'medium'
      )
      
      const action2 = BattleAI.chooseAction(
        battle.player2.fighter,
        battle.player2.currentHealth,
        battle.player1.fighter,
        battle.player1.currentHealth,
        battle,
        'medium'
      )

      battle = BattleEngine.processTurn(battle, action1, action2)
    }

    return battle.winner === 'player1' ? fighter1 : fighter2
  }

  const advanceTournament = async () => {
    if (!tournament) return

    const currentRoundBrackets = tournament.brackets.filter(b => b.round === tournament.currentRound)
    
    // Check if all brackets in current round are completed
    if (!currentRoundBrackets.every(b => b.completed)) return

    // Create next round brackets
    const winners = currentRoundBrackets.map(b => b.winner!).filter(Boolean)
    
    if (winners.length === 1) {
      // Tournament completed!
      setTournament(prev => ({
        ...prev!,
        champion: winners[0],
        completed: true
      }))
      return
    }

    const nextRoundBrackets: TournamentBracket[] = []
    for (let i = 0; i < winners.length; i += 2) {
      nextRoundBrackets.push({
        id: `round${tournament.currentRound + 1}_${i/2}`,
        round: tournament.currentRound + 1,
        fighters: [winners[i], winners[i + 1]],
        completed: false
      })
    }

    setTournament(prev => ({
      ...prev!,
      currentRound: prev!.currentRound + 1,
      brackets: [...prev!.brackets, ...nextRoundBrackets]
    }))
  }

  const handleBattleComplete = async (bracket: TournamentBracket, winner: Fighter) => {
    // Update bracket
    const updatedBracket = { ...bracket, winner, completed: true }
    
    setTournament(prev => ({
      ...prev!,
      brackets: prev!.brackets.map(b => b.id === bracket.id ? updatedBracket : b),
      isPlayerEliminated: prev!.isPlayerEliminated || (winner.owner !== 'player' && bracket.fighters.some(f => f.owner === 'player'))
    }))

    setCurrentBattle(null)

    // Auto-advance tournament after a short delay
    setTimeout(() => {
      advanceTournament()
    }, 2000)
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
        <span className="ml-4 text-xl">Generating Tournament...</span>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={generateTournament} variant="game" size="lg">
          <Trophy className="mr-2 h-5 w-5" />
          Generate New Tournament
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
            >
              {tournament.name}
            </motion.h1>
            <p className="text-muted-foreground">
              Round {tournament.currentRound} of {tournament.maxRounds}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={generateTournament}
            className="flex items-center gap-2"
          >
            <Trophy className="h-4 w-4" />
            New Tournament
          </Button>
        </div>

        {/* Tournament Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span>Fighters: {tournament.totalFighters}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Swords className="h-5 w-5 text-orange-400" />
                    <span>Round: {tournament.currentRound}/{tournament.maxRounds}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {tournament.completed ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Tournament Complete
                    </Badge>
                  ) : tournament.isPlayerEliminated ? (
                    <Badge variant="destructive">Player Eliminated</Badge>
                  ) : (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tournament Bracket */}
        <div className="space-y-8">
          {[1, 2, 3].map(round => {
            const roundBrackets = tournament.brackets.filter(b => b.round === round)
            if (roundBrackets.length === 0) return null

            return (
              <motion.div
                key={round}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: round * 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  {round === 1 ? 'Quarterfinals' : round === 2 ? 'Semifinals' : 'Finals'}
                  <Badge variant="outline">{roundBrackets.length} match{roundBrackets.length !== 1 ? 'es' : ''}</Badge>
                </h2>
                
                <div className={`grid gap-4 ${roundBrackets.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : roundBrackets.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                  {roundBrackets.map((bracket, index) => (
                    <TournamentBracketCard
                      key={bracket.id}
                      bracket={bracket}
                      onStartBattle={startBattle}
                      isPlayerBracket={bracket.fighters.some(f => f.owner === 'player')}
                    />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Champion Display */}
        {tournament.completed && tournament.champion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500/50 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-yellow-400">
                  <Crown className="h-6 w-6" />
                  Tournament Champion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FighterCard
                  fighter={tournament.champion}
                  currentHealth={tournament.champion.health}
                  size="lg"
                  glowEffect={true}
                  showXP={true}
                />
                <div className="mt-4">
                  <Badge variant={tournament.champion.owner === 'player' ? 'success' : 'secondary'} className="text-lg px-4 py-2">
                    {tournament.champion.owner === 'player' ? '🎉 You Won!' : 'Better luck next time!'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Battle Modal would go here - for now we'll simulate AI battles */}
    </div>
  )
}

// Tournament Bracket Component
function TournamentBracketCard({ 
  bracket, 
  onStartBattle, 
  isPlayerBracket 
}: { 
  bracket: TournamentBracket
  onStartBattle: (bracket: TournamentBracket) => void
  isPlayerBracket: boolean
}) {
  const [isSimulating, setIsSimulating] = useState(false)

  const handleBattleClick = async () => {
    if (bracket.completed) return

    // If it's a player bracket, start interactive battle
    if (isPlayerBracket) {
      onStartBattle(bracket)
      return
    }

    // Otherwise, simulate AI vs AI battle
    setIsSimulating(true)
    
    // Simulate battle delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Determine winner based on stats and some randomness
    const fighter1 = bracket.fighters[0]
    const fighter2 = bracket.fighters[1]
    
    const score1 = fighter1.attack + fighter1.defense + fighter1.speed + (Math.random() * 50)
    const score2 = fighter2.attack + fighter2.defense + fighter2.speed + (Math.random() * 50)
    
    const winner = score1 > score2 ? fighter1 : fighter2
    
    // Update bracket (this would normally be handled by parent component)
    setIsSimulating(false)
  }

  return (
    <Card className={`${isPlayerBracket ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-900/50'} transition-all hover:scale-105`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {bracket.fighters.map((fighter, index) => (
            <div key={fighter.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-sm font-bold">{fighter.name[0]}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{fighter.name}</div>
                <div className="text-xs text-muted-foreground">
                  Lvl {fighter.level} • {fighter.element}
                </div>
              </div>
              {bracket.winner?.id === fighter.id && (
                <Crown className="h-4 w-4 text-yellow-400" />
              )}
            </div>
          ))}
          
          <div className="text-center pt-2 border-t border-gray-700">
            {bracket.completed ? (
              <Badge variant="success">Complete</Badge>
            ) : isSimulating ? (
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"
                />
                Battling...
              </div>
            ) : (
              <Button
                variant={isPlayerBracket ? "game" : "secondary"}
                size="sm"
                onClick={handleBattleClick}
                className="w-full"
              >
                {isPlayerBracket ? (
                  <>
                    <Swords className="mr-1 h-3 w-3" />
                    Start Battle
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-1 h-3 w-3" />
                    Simulate
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

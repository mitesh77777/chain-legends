'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FighterCard } from './FighterCard'
import { BattleActions } from './BattleActions'
import { BattleLog, BattleResultLog } from './BattleLog'
import { BattleState, BattleAction, BattleStatus, Fighter } from '@/types/game'
import { BattleEngine } from '@/lib/battle-engine'
import { BattleAI } from '@/lib/battle-ai'
import { cn } from '@/lib/utils'
import { Swords, Clock, Trophy, Users, Bot, User } from 'lucide-react'
import { BattleEffects } from './BattleEffects'
import { StreamChat } from './StreamChat'
import { SoundManager } from './BattleAudio'

interface BattleArenaProps {
  roomId: string
  playerFighter: Fighter
  opponentFighter: Fighter
  isPlayerTurn?: boolean
  onBattleEnd?: (winner: 'player1' | 'player2' | null, battleData: BattleState) => void
  onActionSubmit?: (action: BattleAction) => void
  className?: string
}

export function BattleArena({
  roomId,
  playerFighter,
  opponentFighter,
  isPlayerTurn = true,
  onBattleEnd,
  onActionSubmit,
  className
}: BattleArenaProps) {
  const [battleState, setBattleState] = useState<BattleState>({
    id: roomId,
    player1: {
      fighter: playerFighter,
      currentHealth: playerFighter.health,
      address: 'player1_address' // This would come from wallet
    },
    player2: {
      fighter: opponentFighter,
      currentHealth: opponentFighter.health,
      address: 'player2_address' // This would come from opponent
    },
    currentTurn: 'player1',
    turnNumber: 0,
    status: BattleStatus.ACTIVE,
    actions: [],
    createdAt: Date.now(),
    turnDeadline: Date.now() + 10000
  })

  const [playerAction, setPlayerAction] = useState<BattleAction | null>(null)
  const [opponentAction, setOpponentAction] = useState<BattleAction | null>(null)
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false)
  const [battleStartTime] = useState(Date.now())
  const [aiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [currentEffect, setCurrentEffect] = useState<{
    type: 'attack' | 'defend' | 'special' | 'heal' | 'critical' | 'dodge' | 'weakness'
    element?: Element
    damage?: number
    isVisible: boolean
  } | null>(null)
  const [spectatorCount] = useState(Math.floor(Math.random() * 200) + 50)
  const [battleIntensity, setBattleIntensity] = useState(0)

  // Handle player action selection
  const handlePlayerAction = useCallback((action: BattleAction) => {
    setPlayerAction(action)
    setIsWaitingForOpponent(true)
    
    if (onActionSubmit) {
      onActionSubmit(action)
    }
    
    // Use smart AI for opponent action
    setTimeout(() => {
      const aiAction = BattleAI.chooseAction(
        battleState.player2.fighter,
        battleState.player2.currentHealth,
        battleState.player1.fighter,
        battleState.player1.currentHealth,
        battleState,
        aiDifficulty
      )
      setOpponentAction(aiAction)
    }, 1500 + Math.random() * 1500) // 1.5-3 second thinking time
  }, [onActionSubmit, battleState, aiDifficulty])

  // Process turn when both actions are available
  useEffect(() => {
    if (playerAction && opponentAction && battleState.status === BattleStatus.ACTIVE) {
      const newBattleState = BattleEngine.processTurn(
        battleState,
        playerAction,
        opponentAction
      )
      
      // Calculate battle effects
      const lastAction = newBattleState.actions[newBattleState.actions.length - 1]
      if (lastAction) {
        const damage = lastAction.damage || 0
        const isCritical = damage > 50
        const isWeakness = damage > 40
        
        let effectType: any = 'attack'
        if (playerAction === BattleAction.DEFEND) effectType = 'defend'
        else if (playerAction === BattleAction.SPECIAL) effectType = 'special'
        else if (playerAction === BattleAction.ITEM) effectType = 'heal'
        else if (isCritical) effectType = 'critical'
        else if (isWeakness) effectType = 'weakness'
        
        // Show battle effects
        setCurrentEffect({
          type: effectType,
          element: battleState.player1.fighter.element as any,
          damage,
          isVisible: true
        })
        
        // Update battle intensity
        const healthRatio = Math.min(
          battleState.player1.currentHealth / battleState.player1.fighter.maxHealth,
          battleState.player2.currentHealth / battleState.player2.fighter.maxHealth
        )
        setBattleIntensity(1 - healthRatio)
        
        // Add system message to chat
        if ((window as any).battleChatSystem) {
          const messages = [
            `${battleState.player1.fighter.name} deals ${damage} damage!`,
            `Critical hit for ${damage} damage!`,
            `${battleState.player1.fighter.name} defends successfully!`,
            `Special attack deals ${damage} elemental damage!`
          ]
          const randomMessage = messages[Math.floor(Math.random() * messages.length)]
          setTimeout(() => {
            (window as any).battleChatSystem(randomMessage)
          }, 1000)
        }
        
        // Clear effect after animation
        setTimeout(() => {
          setCurrentEffect(null)
        }, 1500)
      }
      
      setBattleState(newBattleState)
      setPlayerAction(null)
      setOpponentAction(null)
      setIsWaitingForOpponent(false)

      // Check if battle ended
      if (newBattleState.status === BattleStatus.COMPLETED && onBattleEnd) {
        onBattleEnd(newBattleState.winner || null, newBattleState)
      }
    }
  }, [playerAction, opponentAction, battleState, onBattleEnd])

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!playerAction) {
      // Auto-select attack if no action chosen
      handlePlayerAction(BattleAction.ATTACK)
    }
  }, [playerAction, handlePlayerAction])

  const isBattleActive = battleState.status === BattleStatus.ACTIVE
  const isPlayerActionsDisabled = !isBattleActive || isWaitingForOpponent || !isPlayerTurn

  return (
    <div className={cn('w-full max-w-7xl mx-auto p-4 space-y-6', className)}>
      {/* Battle Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 border border-purple-500/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Swords className="h-6 w-6 text-purple-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Battle Arena</h1>
              <p className="text-sm text-muted-foreground">Room: {roomId.slice(-8)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Bot className="h-3 w-3" />
              AI: {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Turn {battleState.turnNumber}
            </Badge>
            <Badge 
              variant={isBattleActive ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              <div className={cn(
                'w-2 h-2 rounded-full',
                isBattleActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              )} />
              {isBattleActive ? 'Active' : 'Ended'}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Player Fighter */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-blue-400">Your Fighter</h2>
            <Badge variant="secondary">Human</Badge>
          </div>
          
          <FighterCard
            fighter={battleState.player1.fighter}
            currentHealth={battleState.player1.currentHealth}
            size="lg"
            glowEffect={battleState.currentTurn === 'player1'}
            showXP={false}
            className="mx-auto"
          />

          {/* Battle Actions */}
          {isBattleActive && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-4">
                <BattleActions
                  onActionSelect={handlePlayerAction}
                  disabled={isPlayerActionsDisabled}
                  timeLimit={10}
                  onTimeUp={handleTimeUp}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center - Battle Log and Status */}
        <div className="space-y-4">
          {/* Current Turn Indicator */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <Card className={cn(
              'bg-gradient-to-r p-4 border-2',
              battleState.currentTurn === 'player1' 
                ? 'from-blue-900/50 to-blue-800/50 border-blue-500'
                : 'from-red-900/50 to-red-800/50 border-red-500'
            )}>
              <div className="flex items-center justify-center gap-2">
                <Swords className="h-5 w-5" />
                <span className="font-semibold">
                  {isWaitingForOpponent ? 'Waiting for opponent...' :
                   battleState.currentTurn === 'player1' ? 'Your Turn' :
                   "Opponent's Turn"}
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Battle Log */}
          <BattleLog
            actions={battleState.actions}
            maxHeight="400px"
          />

          {/* Battle Result */}
          <AnimatePresence>
            {battleState.status === BattleStatus.COMPLETED && (
              <BattleResultLog
                winner={battleState.winner || null}
                totalTurns={battleState.turnNumber}
                battleDuration={Date.now() - battleStartTime}
                playerName="You"
                opponentName="Opponent"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right Side - Opponent Fighter */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">AI Opponent</h2>
            <Badge variant="destructive">
              {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)} AI
            </Badge>
          </div>
          
          <FighterCard
            fighter={battleState.player2.fighter}
            currentHealth={battleState.player2.currentHealth}
            size="lg"
            glowEffect={battleState.currentTurn === 'player2'}
            showXP={false}
            className="mx-auto"
          />

          {/* Opponent Status */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Opponent Status
                </div>
                
                {isWaitingForOpponent && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-yellow-400 font-semibold"
                  >
                    Choosing action...
                  </motion.div>
                )}
                
                {opponentAction && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-green-400 font-semibold"
                  >
                    Action selected!
                  </motion.div>
                )}
                
                {!isWaitingForOpponent && !opponentAction && battleState.currentTurn === 'player2' && (
                  <div className="text-red-400 font-semibold">
                    Making their move...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Battle Controls */}
      {battleState.status === BattleStatus.COMPLETED && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-4"
        >
          <Button
            variant="game"
            size="lg"
            onClick={() => window.location.reload()} // In real app, this would navigate to matchmaking
          >
            <Trophy className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => {/* Navigate to home */}}
          >
            Return to Menu
          </Button>
        </motion.div>
      )}
    </div>
  )
}
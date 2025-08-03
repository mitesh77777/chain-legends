'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BattleActionRecord } from '@/types/game'
import { cn } from '@/lib/utils'
import { Sword, Shield, Zap, Heart, Crown, Target } from 'lucide-react'

interface BattleLogProps {
  actions: BattleActionRecord[]
  className?: string
  maxHeight?: string
}

export function BattleLog({ actions, className, maxHeight = '300px' }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new actions are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [actions])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'attack': return Sword
      case 'defend': return Shield
      case 'special': return Zap
      case 'item': return Heart
      default: return Target
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'attack': return 'text-red-400'
      case 'defend': return 'text-blue-400'
      case 'special': return 'text-purple-400'
      case 'item': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const formatLogEntry = (action: BattleActionRecord) => {
    const Icon = getActionIcon(action.action)
    const colorClass = getActionColor(action.action)
    const isPlayer1 = action.playerId === 'player1'
    
    let logText = ''
    let damageText = ''
    
    if (action.damage && action.damage > 0) {
      damageText = `${action.damage} damage`
      logText = `used ${action.action.toUpperCase()}`
    } else if (action.damage && action.damage < 0) {
      damageText = `${-action.damage} HP restored`
      logText = `used ${action.action.toUpperCase()}`
    } else {
      logText = `used ${action.action.toUpperCase()}`
    }

    return {
      Icon,
      colorClass,
      isPlayer1,
      logText,
      damageText,
      effect: action.effect,
      timestamp: action.timestamp
    }
  }

  return (
    <div className={cn('bg-gray-900/50 border border-gray-700 rounded-lg', className)}>
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Target className="h-4 w-4" />
          Battle Log
        </h3>
      </div>
      
      <ScrollArea 
        className="p-3" 
        style={{ maxHeight }}
        ref={scrollRef}
      >
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {actions.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Battle actions will appear here...
              </div>
            ) : (
              actions.map((action, index) => {
                const logEntry = formatLogEntry(action)
                
                return (
                  <motion.div
                    key={`${action.timestamp}-${index}`}
                    initial={{ opacity: 0, x: logEntry.isPlayer1 ? -20 : 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className={cn(
                      'flex items-start gap-2 p-2 rounded-lg text-sm',
                      logEntry.isPlayer1 
                        ? 'bg-blue-900/20 border-l-2 border-blue-500' 
                        : 'bg-red-900/20 border-l-2 border-red-500'
                    )}
                  >
                    {/* Action Icon */}
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      logEntry.isPlayer1 ? 'bg-blue-500/20' : 'bg-red-500/20'
                    )}>
                      <logEntry.Icon className={cn('h-3 w-3', logEntry.colorClass)} />
                    </div>

                    {/* Log Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-semibold',
                          logEntry.isPlayer1 ? 'text-blue-400' : 'text-red-400'
                        )}>
                          {logEntry.isPlayer1 ? 'You' : 'Opponent'}
                        </span>
                        <span className="text-muted-foreground">
                          {logEntry.logText}
                        </span>
                      </div>

                      {/* Damage/Effect */}
                      {(logEntry.damageText || logEntry.effect) && (
                        <div className="mt-1 text-xs">
                          {logEntry.damageText && (
                            <span className={cn(
                              'font-semibold',
                              action.damage && action.damage > 0 ? 'text-red-300' : 'text-green-300'
                            )}>
                              {logEntry.damageText}
                            </span>
                          )}
                          {logEntry.effect && (
                            <span className={cn(
                              'ml-2 italic',
                              logEntry.effect.includes('Critical') ? 'text-yellow-400' :
                              logEntry.effect.includes('Super Effective') ? 'text-green-400' :
                              logEntry.effect.includes('Not very effective') ? 'text-gray-400' :
                              'text-purple-300'
                            )}>
                              {logEntry.effect}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Turn Number */}
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      #{index + 1}
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}

interface BattleResultLogProps {
  winner: 'player1' | 'player2' | null
  totalTurns: number
  battleDuration?: number
  playerName?: string
  opponentName?: string
  className?: string
}

export function BattleResultLog({ 
  winner, 
  totalTurns, 
  battleDuration,
  playerName = 'You',
  opponentName = 'Opponent',
  className 
}: BattleResultLogProps) {
  const winnerName = winner === 'player1' ? playerName : winner === 'player2' ? opponentName : 'Draw'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-gradient-to-br rounded-lg p-6 text-center border-2',
        winner === 'player1' 
          ? 'from-green-900/50 to-emerald-900/50 border-green-500'
          : winner === 'player2'
          ? 'from-red-900/50 to-rose-900/50 border-red-500'
          : 'from-gray-900/50 to-slate-900/50 border-gray-500',
        className
      )}
    >
      <div className="flex items-center justify-center mb-4">
        <Crown className={cn(
          'h-12 w-12',
          winner === 'player1' ? 'text-yellow-400' :
          winner === 'player2' ? 'text-red-400' :
          'text-gray-400'
        )} />
      </div>

      <h2 className={cn(
        'text-2xl font-bold mb-2',
        winner === 'player1' ? 'text-green-400' :
        winner === 'player2' ? 'text-red-400' :
        'text-gray-400'
      )}>
        {winner ? `${winnerName} Wins!` : 'Draw!'}
      </h2>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div>Battle lasted {totalTurns} turns</div>
        {battleDuration && (
          <div>Duration: {Math.floor(battleDuration / 1000)}s</div>
        )}
      </div>

      {winner === 'player1' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-green-300 text-sm"
        >
          🎉 Victory! You gained experience and ranking points!
        </motion.div>
      )}
    </motion.div>
  )
}
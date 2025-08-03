'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BattleAction } from '@/types/game'
import { Sword, Shield, Zap, Heart, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BattleActionsProps {
  onActionSelect: (action: BattleAction) => void
  disabled?: boolean
  timeLimit?: number // in seconds
  onTimeUp?: () => void
  className?: string
}

export function BattleActions({ 
  onActionSelect, 
  disabled = false, 
  timeLimit = 10,
  onTimeUp,
  className 
}: BattleActionsProps) {
  const [selectedAction, setSelectedAction] = useState<BattleAction | null>(null)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [isTimeUp, setIsTimeUp] = useState(false)

  useEffect(() => {
    if (disabled || timeLimit <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true)
          if (onTimeUp) onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [disabled, timeLimit, onTimeUp])

  useEffect(() => {
    // Reset timer when component resets
    if (!disabled) {
      setTimeLeft(timeLimit)
      setIsTimeUp(false)
      setSelectedAction(null)
    }
  }, [disabled, timeLimit])

  const handleActionSelect = useCallback((action: BattleAction) => {
    if (disabled || isTimeUp) return
    
    setSelectedAction(action)
    onActionSelect(action)
  }, [disabled, isTimeUp, onActionSelect])

  const timePercentage = (timeLeft / timeLimit) * 100
  const isTimeRunningOut = timeLeft <= 3

  const actionButtons = [
    {
      action: BattleAction.ATTACK,
      label: 'Attack',
      icon: Sword,
      color: 'from-red-600 to-red-700',
      hoverColor: 'from-red-700 to-red-800',
      description: 'Deal damage to opponent',
      shortcut: '1'
    },
    {
      action: BattleAction.DEFEND,
      label: 'Defend',
      icon: Shield,
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'from-blue-700 to-blue-800',
      description: 'Reduce incoming damage',
      shortcut: '2'
    },
    {
      action: BattleAction.SPECIAL,
      label: 'Special',
      icon: Zap,
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'from-purple-700 to-purple-800',
      description: 'Powerful special attack',
      shortcut: '3'
    },
    {
      action: BattleAction.ITEM,
      label: 'Heal',
      icon: Heart,
      color: 'from-green-600 to-green-700',
      hoverColor: 'from-green-700 to-green-800',
      description: 'Restore health',
      shortcut: '4'
    }
  ]

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled || isTimeUp) return

      const keyMap: Record<string, BattleAction> = {
        '1': BattleAction.ATTACK,
        '2': BattleAction.DEFEND,
        '3': BattleAction.SPECIAL,
        '4': BattleAction.ITEM
      }

      const action = keyMap[e.key]
      if (action) {
        handleActionSelect(action)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [disabled, isTimeUp, handleActionSelect])

  return (
    <motion.div 
      className={cn('space-y-4', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Turn Timer */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className={cn(
              'h-4 w-4',
              isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-blue-400'
            )} />
            <span className="text-sm font-medium">
              Choose your action
            </span>
          </div>
          <span className={cn(
            'text-lg font-bold',
            isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-white'
          )}>
            {timeLeft}s
          </span>
        </div>
        
        <Progress
          value={timePercentage}
          className={cn(
            'h-2',
            isTimeRunningOut && 'animate-pulse'
          )}
        />
        <div
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear',
            isTimeRunningOut ? 'bg-red-500' : 'bg-blue-500'
          )}
          style={{ width: `${timePercentage}%` }}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {actionButtons.map((actionButton, index) => {
            const Icon = actionButton.icon
            const isSelected = selectedAction === actionButton.action
            const isDisabled = disabled || isTimeUp

            return (
              <motion.div
                key={actionButton.action}
                initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
              >
                <Button
                  onClick={() => handleActionSelect(actionButton.action)}
                  disabled={isDisabled}
                  className={cn(
                    'w-full h-20 flex flex-col items-center justify-center gap-2 text-white font-bold relative overflow-hidden',
                    `bg-gradient-to-r ${actionButton.color}`,
                    !isDisabled && `hover:bg-gradient-to-r hover:${actionButton.hoverColor}`,
                    isSelected && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-900',
                    isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Selection Effect */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{actionButton.label}</span>
                  
                  {/* Keyboard shortcut */}
                  <span className="absolute top-1 right-2 text-xs opacity-70">
                    {actionButton.shortcut}
                  </span>

                  {/* Disabled overlay */}
                  {isDisabled && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      {isTimeUp && (
                        <span className="text-xs text-red-400 font-semibold">
                          TIME UP
                        </span>
                      )}
                    </div>
                  )}
                </Button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Action Descriptions */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {actionButtons.map((actionButton) => (
          <div key={actionButton.action} className="text-center">
            {actionButton.description}
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-center text-xs text-muted-foreground">
        Use keys 1-4 for quick selection
      </div>

      {/* Selected Action Confirmation */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-900/50 border border-green-600 rounded-lg p-3 text-center"
          >
            <span className="text-green-400 font-semibold">
              Action Selected: {actionButtons.find(a => a.action === selectedAction)?.label}
            </span>
            <div className="text-xs text-green-300 mt-1">
              Waiting for opponent...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
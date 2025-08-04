'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BattleAction } from '@/types/game'
import { Sword, Shield, Zap, Heart, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BattleAudio } from './BattleAudio'

interface BattleActionsProps {
  onActionSelect: (action: BattleAction) => void
  disabled?: boolean
  timeLimit?: number
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
  const [intensity, setIntensity] = useState(0)

  useEffect(() => {
    if (disabled || timeLimit <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimeUp(true)
          BattleAudio.playSound('timeup')
          if (onTimeUp) onTimeUp()
          return 0
        }
        
        if (prev <= 4 && prev > 1) {
          BattleAudio.playSound('countdown')
        }
        
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [disabled, timeLimit, onTimeUp])

  useEffect(() => {
    const newIntensity = Math.max(0, (timeLimit - timeLeft) / timeLimit)
    setIntensity(newIntensity)
  }, [timeLeft, timeLimit])

  useEffect(() => {
    if (!disabled) {
      setTimeLeft(timeLimit)
      setIsTimeUp(false)
      setSelectedAction(null)
      setIntensity(0)
    }
  }, [disabled, timeLimit])

  const handleActionSelect = useCallback((action: BattleAction) => {
    if (disabled || isTimeUp) return
    
    setSelectedAction(action)
    
    switch (action) {
      case BattleAction.ATTACK:
        BattleAudio.playSound('attack')
        break
      case BattleAction.DEFEND:
        BattleAudio.playSound('defend')
        break
      case BattleAction.SPECIAL:
        BattleAudio.playSound('special')
        break
      case BattleAction.ITEM:
        BattleAudio.playSound('heal')
        break
    }
    
    if ((window as any).battleChatReact) {
      const actionNames = {
        [BattleAction.ATTACK]: 'attack',
        [BattleAction.DEFEND]: 'defend',
        [BattleAction.SPECIAL]: 'special',
        [BattleAction.ITEM]: 'heal'
      }
      setTimeout(() => {
        (window as any).battleChatReact(actionNames[action])
      }, 500)
    }
    
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
      description: 'Deal damage to opponent',
      shortcut: '1'
    },
    {
      action: BattleAction.DEFEND,
      label: 'Defend',
      icon: Shield,
      color: 'from-blue-600 to-blue-700',
      description: 'Reduce incoming damage',
      shortcut: '2'
    },
    {
      action: BattleAction.SPECIAL,
      label: 'Special',
      icon: Zap,
      color: 'from-purple-600 to-purple-700',
      description: 'Powerful special attack',
      shortcut: '3'
    },
    {
      action: BattleAction.ITEM,
      label: 'Heal',
      icon: Heart,
      color: 'from-green-600 to-green-700',
      description: 'Restore health',
      shortcut: '4'
    }
  ]

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
      <motion.div 
        className={cn(
          "relative overflow-hidden rounded-lg p-4 border transition-all duration-300",
          isTimeRunningOut 
            ? "bg-red-900/30 border-red-500/50" 
            : "bg-gray-800/50 border-gray-700"
        )}
        animate={{
          boxShadow: isTimeRunningOut 
            ? '0 0 20px rgba(239, 68, 68, 0.3)' 
            : undefined
        }}
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={isTimeRunningOut ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ 
                  duration: 0.5, 
                  repeat: isTimeRunningOut ? Infinity : 0 
                }}
              >
                <Clock className={cn(
                  'h-5 w-5 transition-colors duration-300',
                  isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-blue-400'
                )} />
              </motion.div>
              <span className={cn(
                "text-sm font-bold transition-colors duration-300",
                isTimeRunningOut ? 'text-red-300' : 'text-white'
              )}>
                {isTimeRunningOut ? '⚡ DECIDE NOW!' : 'Choose your action'}
              </span>
            </div>
            <motion.span 
              className={cn(
                'text-2xl font-black transition-all duration-300',
                isTimeRunningOut ? 'text-red-400 drop-shadow-lg' : 'text-white'
              )}
              animate={isTimeRunningOut ? {
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 1, repeat: isTimeRunningOut ? Infinity : 0 }}
            >
              {timeLeft}s
            </motion.span>
          </div>
          
          <div className="relative">
            <Progress
              value={timePercentage}
              className={cn(
                'h-3 transition-all duration-300',
                isTimeRunningOut && 'animate-pulse'
              )}
            />
          </div>

          <div className="mt-2 text-center">
            <span className={cn(
              "text-xs font-medium transition-colors duration-300",
              intensity > 0.7 ? 'text-red-400' :
              intensity > 0.4 ? 'text-yellow-400' : 'text-gray-400'
            )}>
              {intensity > 0.8 ? '🔥 PRESSURE IS ON!' :
               intensity > 0.6 ? '⚡ Time Running Out!' :
               intensity > 0.3 ? '⏰ Think Fast!' : '🎯 Take Your Time'}
            </span>
          </div>
        </div>
      </motion.div>

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
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotateX: 0,
                  y: isTimeRunningOut ? Math.sin(Date.now() * 0.01 + index) * 1 : 0
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={!isDisabled ? { 
                  scale: 1.05,
                  rotateY: 3
                } : {}}
                whileTap={!isDisabled ? { 
                  scale: 0.95
                } : {}}
              >
                <Button
                  onClick={() => handleActionSelect(actionButton.action)}
                  disabled={isDisabled}
                  className={cn(
                    'w-full h-24 flex flex-col items-center justify-center gap-2 text-white font-bold relative overflow-hidden transition-all duration-300 border-2',
                    `bg-gradient-to-br ${actionButton.color}`,
                    isSelected && 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900 scale-105',
                    isDisabled && 'opacity-50 cursor-not-allowed',
                    isTimeRunningOut && 'border-red-400/50 animate-pulse'
                  )}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] hover:translate-x-[100%]" />
                  
                  {/* Selection Effect */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-400/30"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Intensity pulse effect */}
                  {isTimeRunningOut && (
                    <motion.div
                      className="absolute inset-0 bg-red-500/20"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    />
                  )}

                  <motion.div
                    animate={isTimeRunningOut ? {
                      rotate: [0, -2, 2, 0],
                      scale: [1, 1.05, 1]
                    } : {}}
                    transition={{ 
                      duration: 0.5, 
                      repeat: isTimeRunningOut ? Infinity : 0,
                      delay: index * 0.1
                    }}
                  >
                    <Icon className="h-8 w-8 drop-shadow-lg" />
                  </motion.div>
                  
                  <span className="text-sm font-bold drop-shadow">
                    {actionButton.label}
                  </span>
                  
                  {/* Keyboard shortcut with glow */}
                  <motion.span 
                    className={cn(
                      "absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded transition-all duration-300",
                      isTimeRunningOut 
                        ? 'bg-red-500/80 text-white animate-pulse' 
                        : 'bg-black/50 text-white/70'
                    )}
                    animate={isTimeRunningOut ? {
                      boxShadow: [
                        '0 0 0px rgba(239, 68, 68, 0)',
                        '0 0 10px rgba(239, 68, 68, 0.8)',
                        '0 0 0px rgba(239, 68, 68, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 1, repeat: isTimeRunningOut ? Infinity : 0 }}
                  >
                    {actionButton.shortcut}
                  </motion.span>

                  {/* Disabled overlay */}
                  {isDisabled && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                      {isTimeUp && (
                        <motion.span 
                          className="text-sm text-red-400 font-bold"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          TIME UP!
                        </motion.span>
                      )}
                    </div>
                  )}
                </Button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Enhanced Action Descriptions */}
      <motion.div 
        className="grid grid-cols-2 gap-2 text-xs"
        animate={{ opacity: isTimeRunningOut ? 0.7 : 1 }}
      >
        {actionButtons.map((actionButton) => (
          <motion.div 
            key={actionButton.action} 
            className={cn(
              "text-center p-2 rounded transition-colors duration-300",
              selectedAction === actionButton.action 
                ? 'text-yellow-300 bg-yellow-900/20' 
                : 'text-gray-400'
            )}
            animate={selectedAction === actionButton.action ? {
              scale: [1, 1.02, 1]
            } : {}}
            transition={{ duration: 0.3 }}
          >
            {actionButton.description}
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Keyboard shortcuts hint */}
      <motion.div 
        className="text-center text-xs font-medium"
        animate={{
          color: isTimeRunningOut ? '#fbbf24' : '#9ca3af'
        }}
      >
        <motion.span
          animate={isTimeRunningOut ? {
            scale: [1, 1.05, 1]
          } : {}}
          transition={{ duration: 0.5, repeat: isTimeRunningOut ? Infinity : 0 }}
        >
          ⚡ Press 1-4 for INSTANT action! ⚡
        </motion.span>
      </motion.div>

      {/* Selected Action Confirmation with enhanced effects */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="relative overflow-hidden bg-gradient-to-r from-green-900/80 to-emerald-900/80 border-2 border-green-500 rounded-lg p-4 text-center"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-transparent"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative z-10">
              <motion.span 
                className="text-green-300 font-bold text-lg flex items-center justify-center gap-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⚡ Action Locked: {actionButtons.find(a => a.action === selectedAction)?.label}!
              </motion.span>
              <motion.div 
                className="text-sm text-green-200 mt-2 flex items-center justify-center gap-2"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Waiting for opponent's move...
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

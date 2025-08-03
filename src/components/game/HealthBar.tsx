'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface HealthBarProps {
  currentHealth: number
  maxHealth: number
  className?: string
  showNumbers?: boolean
  animated?: boolean
  label?: string
}

export function HealthBar({ 
  currentHealth, 
  maxHealth, 
  className, 
  showNumbers = true,
  animated = true,
  label 
}: HealthBarProps) {
  const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100)
  const isLow = healthPercentage < 25
  const isCritical = healthPercentage < 10

  const getHealthColor = () => {
    if (isCritical) return 'bg-red-600'
    if (isLow) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const HealthProgressBar = (
    <div className={cn('relative w-full', className)}>
      {label && (
        <div className="flex items-center gap-2 mb-1">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
      )}
      
      <div className="relative">
        <Progress
          value={healthPercentage}
          className={cn(
            'h-6 bg-gray-800/50 border border-gray-600',
            isCritical && animated && 'animate-pulse'
          )}
        />
        
        {/* Health bar fill with gradient */}
        <div
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out',
            getHealthColor(),
            'bg-gradient-to-r',
            isCritical ? 'from-red-600 to-red-500' :
            isLow ? 'from-orange-500 to-yellow-500' :
            'from-green-500 to-green-400'
          )}
          style={{ width: `${healthPercentage}%` }}
        />
        
        {/* Health numbers overlay */}
        {showNumbers && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'text-xs font-bold text-white drop-shadow-lg',
              isCritical && 'animate-pulse'
            )}>
              {currentHealth} / {maxHealth}
            </span>
          </div>
        )}
        
        {/* Critical health warning */}
        {isCritical && animated && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <div className="absolute top-0 w-3 h-3 bg-red-600 rounded-full" />
          </div>
        )}
      </div>
      
      {/* Health status text */}
      <div className="flex justify-between items-center mt-1">
        <span className={cn(
          'text-xs font-medium',
          isCritical ? 'text-red-400' :
          isLow ? 'text-orange-400' :
          'text-green-400'
        )}>
          {isCritical ? 'Critical!' : 
           isLow ? 'Low Health' : 
           'Healthy'}
        </span>
        
        <span className="text-xs text-muted-foreground">
          {healthPercentage.toFixed(0)}%
        </span>
      </div>
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {HealthProgressBar}
      </motion.div>
    )
  }

  return HealthProgressBar
}

interface ExperienceBarProps {
  currentXP: number
  level: number
  className?: string
  showLevel?: boolean
}

export function ExperienceBar({ 
  currentXP, 
  level, 
  className,
  showLevel = true 
}: ExperienceBarProps) {
  const xpForCurrentLevel = (level - 1) * 100
  const xpForNextLevel = level * 100
  const currentLevelXP = currentXP - xpForCurrentLevel
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel
  const xpPercentage = (currentLevelXP / xpNeededForNextLevel) * 100

  return (
    <motion.div 
      className={cn('w-full', className)}
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      transition={{ duration: 0.5 }}
    >
      {showLevel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-blue-400">Level {level}</span>
          <span className="text-xs text-muted-foreground">
            {currentLevelXP} / {xpNeededForNextLevel} XP
          </span>
        </div>
      )}
      
      <div className="relative">
        <Progress
          value={xpPercentage}
          className="h-3 bg-gray-800/50 border border-gray-600"
        />
        
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${xpPercentage}%` }}
        />
      </div>
    </motion.div>
  )
}
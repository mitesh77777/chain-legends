'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HealthBar, ExperienceBar } from './HealthBar'
import { Fighter } from '@/types/game'
import { getElementName, getElementColor, cn } from '@/lib/utils'
import { Sword, Shield, Zap, Heart } from 'lucide-react'

interface FighterCardProps {
  fighter: Fighter
  currentHealth?: number
  className?: string
  interactive?: boolean
  showXP?: boolean
  size?: 'sm' | 'md' | 'lg'
  glowEffect?: boolean
  onClick?: () => void
}

export function FighterCard({
  fighter,
  currentHealth,
  className,
  interactive = false,
  showXP = true,
  size = 'md',
  glowEffect = false,
  onClick
}: FighterCardProps) {
  const health = currentHealth ?? fighter.health
  const elementColor = getElementColor(fighter.element)
  const elementName = getElementName(fighter.element)

  const sizeClasses = {
    sm: 'w-48 h-64',
    md: 'w-64 h-80',
    lg: 'w-80 h-96'
  }

  const cardVariants = {
    idle: { 
      scale: 1, 
      rotateY: 0,
      boxShadow: glowEffect ? '0 0 20px rgba(139, 92, 246, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    hover: { 
      scale: interactive ? 1.05 : 1, 
      rotateY: interactive ? 5 : 0,
      boxShadow: interactive ? '0 0 30px rgba(139, 92, 246, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    tap: { 
      scale: interactive ? 0.98 : 1 
    }
  }

  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      variants={cardVariants}
      initial="idle"
      animate="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      <Card className={cn(
        'h-full bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-gray-700/50 overflow-hidden',
        'transition-all duration-300',
        glowEffect && 'shadow-2xl shadow-purple-500/20',
        interactive && 'hover:shadow-purple-500/30'
      )}>
        {/* Fighter Image Section */}
        <div className={cn(
          'relative h-32 bg-gradient-to-br overflow-hidden',
          elementName === 'Fire' && 'from-red-600/20 to-orange-600/20',
          elementName === 'Water' && 'from-blue-600/20 to-cyan-600/20',
          elementName === 'Earth' && 'from-green-600/20 to-emerald-600/20',
          elementName === 'Air' && 'from-gray-600/20 to-slate-600/20'
        )}>
          {/* Placeholder for fighter image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl font-bold',
              elementName === 'Fire' && 'from-red-500 to-orange-500 text-white',
              elementName === 'Water' && 'from-blue-500 to-cyan-500 text-white',
              elementName === 'Earth' && 'from-green-500 to-emerald-500 text-white',
              elementName === 'Air' && 'from-gray-500 to-slate-500 text-white'
            )}>
              {fighter.name.charAt(0)}
            </div>
          </div>

          {/* Level Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              Lv. {fighter.level}
            </Badge>
          </div>

          {/* Element Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={cn('text-white', elementColor)}>
              {elementName}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-center truncate">
            {fighter.name}
          </CardTitle>
          
          {/* Health Bar */}
          <HealthBar
            currentHealth={health}
            maxHealth={fighter.maxHealth}
            animated={true}
            className="mt-2"
          />
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Sword className="h-4 w-4 text-red-400" />
              <span className="text-muted-foreground">ATK:</span>
              <span className="font-semibold text-red-400">{fighter.attack}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-muted-foreground">DEF:</span>
              <span className="font-semibold text-blue-400">{fighter.defense}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-muted-foreground">SPD:</span>
              <span className="font-semibold text-yellow-400">{fighter.speed}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-green-400" />
              <span className="text-muted-foreground">HP:</span>
              <span className="font-semibold text-green-400">{fighter.maxHealth}</span>
            </div>
          </div>

          {/* Win/Loss Record */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Wins: <span className="text-green-400 font-semibold">{fighter.wins}</span></span>
            <span>Losses: <span className="text-red-400 font-semibold">{fighter.losses}</span></span>
          </div>

          {/* Experience Bar */}
          {showXP && (
            <ExperienceBar
              currentXP={fighter.experience}
              level={fighter.level}
              className="mt-3"
            />
          )}

          {/* Equipment Preview */}
          {(fighter.weaponId || fighter.armorId) && (
            <div className="flex gap-2 mt-2">
              {fighter.weaponId && (
                <Badge variant="outline" className="text-xs">
                  ⚔️ Weapon
                </Badge>
              )}
              {fighter.armorId && (
                <Badge variant="outline" className="text-xs">
                  🛡️ Armor
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface FighterPreviewProps {
  fighter: Fighter
  className?: string
}

export function FighterPreview({ fighter, className }: FighterPreviewProps) {
  return (
    <motion.div
      className={cn('flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700', className)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Fighter Avatar */}
      <div className={cn(
        'w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-lg font-bold flex-shrink-0',
        getElementName(fighter.element) === 'Fire' && 'from-red-500 to-orange-500 text-white',
        getElementName(fighter.element) === 'Water' && 'from-blue-500 to-cyan-500 text-white',
        getElementName(fighter.element) === 'Earth' && 'from-green-500 to-emerald-500 text-white',
        getElementName(fighter.element) === 'Air' && 'from-gray-500 to-slate-500 text-white'
      )}>
        {fighter.name.charAt(0)}
      </div>

      {/* Fighter Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold truncate">{fighter.name}</h3>
          <Badge variant="secondary" className="text-xs">
            Lv. {fighter.level}
          </Badge>
          <Badge className={cn('text-xs', getElementColor(fighter.element))}>
            {getElementName(fighter.element)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <span>⚔️ {fighter.attack}</span>
          <span>🛡️ {fighter.defense}</span>
          <span>⚡ {fighter.speed}</span>
          <span className="text-green-400">{fighter.wins}W</span>
          <span className="text-red-400">{fighter.losses}L</span>
        </div>
      </div>
    </motion.div>
  )
}
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Element } from '@/types/game'

interface BattleEffectsProps {
  effectType: 'attack' | 'defend' | 'special' | 'heal' | 'critical' | 'dodge' | 'weakness'
  element?: Element
  damage?: number
  isVisible: boolean
  onComplete?: () => void
}

const elementColors = {
  0: { primary: '#ef4444', secondary: '#dc2626', name: 'Fire' }, // Fire - red
  1: { primary: '#3b82f6', secondary: '#2563eb', name: 'Water' }, // Water - blue
  2: { primary: '#22c55e', secondary: '#16a34a', name: 'Earth' }, // Earth - green
  3: { primary: '#a855f7', secondary: '#9333ea', name: 'Air' }, // Air - purple
}

export function BattleEffects({ 
  effectType, 
  element = 0, 
  damage, 
  isVisible, 
  onComplete 
}: BattleEffectsProps) {
  const colors = elementColors[element as keyof typeof elementColors]

  const getEffectConfig = () => {
    switch (effectType) {
      case 'attack':
        return {
          text: `${damage}`,
          color: '#ef4444',
          scale: 1.5,
          particles: 8,
          icon: '⚔️'
        }
      case 'critical':
        return {
          text: `CRITICAL! ${damage}`,
          color: '#fbbf24',
          scale: 2,
          particles: 15,
          icon: '💥'
        }
      case 'special':
        return {
          text: `${colors.name.toUpperCase()}! ${damage}`,
          color: colors.primary,
          scale: 1.8,
          particles: 12,
          icon: element === 0 ? '🔥' : element === 1 ? '💧' : element === 2 ? '🌿' : '💨'
        }
      case 'heal':
        return {
          text: `+${damage}`,
          color: '#22c55e',
          scale: 1.3,
          particles: 6,
          icon: '💝'
        }
      case 'defend':
        return {
          text: 'BLOCKED!',
          color: '#6b7280',
          scale: 1.2,
          particles: 4,
          icon: '🛡️'
        }
      case 'dodge':
        return {
          text: 'MISS!',
          color: '#a855f7',
          scale: 1.4,
          particles: 8,
          icon: '💨'
        }
      case 'weakness':
        return {
          text: `SUPER EFFECTIVE! ${damage}`,
          color: '#f59e0b',
          scale: 2.2,
          particles: 18,
          icon: '⚡'
        }
      default:
        return {
          text: '',
          color: '#ffffff',
          scale: 1,
          particles: 0,
          icon: ''
        }
    }
  }

  const config = getEffectConfig()

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Main effect text */}
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{ 
              scale: [0, config.scale, config.scale * 0.8],
              opacity: [0, 1, 0],
              y: [0, -50, -100]
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.3, 1],
              ease: "easeOut"
            }}
            onAnimationComplete={onComplete}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div 
              className="text-6xl font-black text-center drop-shadow-2xl"
              style={{ 
                color: config.color,
                textShadow: `0 0 20px ${config.color}, 0 0 40px ${config.color}`,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))'
              }}
            >
              {config.icon}
              <div className="text-2xl mt-1 font-bold">
                {config.text}
              </div>
            </div>
          </motion.div>

          {/* Particle effects */}
          {Array.from({ length: config.particles }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                scale: 0,
                opacity: 1,
                x: '50vw',
                y: '50vh'
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                x: `${50 + (Math.random() - 0.5) * 60}vw`,
                y: `${50 + (Math.random() - 0.5) * 60}vh`,
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 1 + Math.random() * 0.5,
                delay: Math.random() * 0.3,
                ease: "easeOut"
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
          ))}

          {/* Screen shake effect container */}
          <motion.div
            initial={{ x: 0, y: 0 }}
            animate={effectType === 'critical' || effectType === 'weakness' ? {
              x: [-2, 2, -2, 2, 0],
              y: [-1, 1, -1, 1, 0]
            } : {}}
            transition={{ duration: 0.3, repeat: 2 }}
            className="absolute inset-0"
          />
        </div>
      )}
    </AnimatePresence>
  )
}

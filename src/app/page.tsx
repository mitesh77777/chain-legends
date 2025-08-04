'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WalletConnect } from '@/components/wallet/WalletConnect'
import { FighterCard } from '@/components/game/FighterCard'
import { useWallet } from '@/components/wallet/WalletProvider'
import { Fighter, Element } from '@/types/game'
import { generateRandomName, generateId } from '@/lib/utils'
import { BattleEngine } from '@/lib/battle-engine'
import { 
  Swords, 
  Trophy, 
  Users, 
  Zap, 
  Crown, 
  Play,
  Gamepad2,
  Target,
  Star
} from 'lucide-react'

export default function HomePage() {
  const { isConnected, address } = useWallet()
  const [playerFighter, setPlayerFighter] = useState<Fighter | null>(null)
  const [isGeneratingFighter, setIsGeneratingFighter] = useState(false)

  const generateDemoFighter = useCallback(async () => {
    setIsGeneratingFighter(true)
    
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const element = Math.floor(Math.random() * 4) as Element
    const level = 1
    const stats = BattleEngine.generateFighterStats(element, level)
    
    const fighter: Fighter = {
      id: generateId(),
      tokenId: '1',
      name: generateRandomName(),
      element,
      level,
      experience: 0,
      wins: 0,
      losses: 0,
      health: stats.health,
      maxHealth: stats.health,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      lastBattle: Date.now(),
      owner: address || '',
      imageUrl: '/fighters/default.png'
    }
    
    setPlayerFighter(fighter)
    setIsGeneratingFighter(false)
  }, [address])

  // Generate a demo fighter when wallet is connected
  useEffect(() => {
    if (isConnected && !playerFighter) {
      generateDemoFighter()
    }
  }, [isConnected, playerFighter, generateDemoFighter])

  const handleStartBattle = () => {
    // In a real app, this would navigate to matchmaking
    window.location.href = '/battle/demo-room'
  }

  const statsCards = [
    { icon: Users, label: 'Active Players', value: '2,847', color: 'text-blue-400' },
    { icon: Swords, label: 'Battles Today', value: '1,293', color: 'text-red-400' },
    { icon: Trophy, label: 'Tournaments', value: '24', color: 'text-yellow-400' },
    { icon: Crown, label: 'Champions', value: '156', color: 'text-purple-400' },
  ]

  const features = [
    {
      icon: Gamepad2,
      title: 'Turn-Based Combat',
      description: 'Strategic battles with Attack, Defend, Special, and Item actions'
    },
    {
      icon: Zap,
      title: 'Elemental System',
      description: 'Fire, Water, Earth, and Air elements with type advantages'
    },
    {
      icon: Target,
      title: 'Real-Time Battles',
      description: 'Fast-paced 10-second turns with live opponents'
    },
    {
      icon: Star,
      title: 'NFT Evolution',
      description: 'Your fighters level up and evolve through victories'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Swords className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Chain Legends
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/battle/demo-room">
                <Button variant="outline" size="sm">
                  <Play className="mr-2 h-4 w-4" />
                  Quick Battle
                </Button>
              </Link>
              <Link href="/tournament">
                <Button variant="outline" size="sm">
                  <Trophy className="mr-2 h-4 w-4" />
                  Tournament
                </Button>
              </Link>
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 pt-32">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-game">
              CHAIN LEGENDS
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Battle, Collect, and Earn in the Ultimate Web3 Arena
            </p>
            
            {/* Wallet Connection Section */}
            <div className="mb-12">
              {!isConnected ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto border border-gray-700"
                >
                  <h3 className="text-2xl font-bold mb-4 text-white">Ready to Play?</h3>
                  <p className="text-gray-300 mb-6">Connect your wallet to start your journey as a Chain Legend!</p>
                  <WalletConnect className="w-full py-3 text-lg" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto border border-green-500/30"
                >
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-2xl font-bold text-white">Welcome, Champion!</h3>
                  </div>
                  <WalletConnect className="mb-4" />
                  
                  {playerFighter ? (
                    <div className="space-y-4">
                      <p className="text-gray-300">Your fighter is ready for battle!</p>
                      <div className="grid grid-cols-1 gap-3">
                        <Button 
                          onClick={handleStartBattle}
                          className="w-full py-3 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                          size="lg"
                        >
                          <Play className="mr-2 h-5 w-5" />
                          Quick Battle
                        </Button>
                        <Link href="/tournament" className="w-full">
                          <Button 
                            className="w-full py-3 text-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                            size="lg"
                          >
                            <Trophy className="mr-2 h-5 w-5" />
                            Join Tournament
                          </Button>
                        </Link>
                        <Link href="/blockchain" className="w-full">
                          <Button 
                            className="w-full py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            size="lg"
                          >
                            <Star className="mr-2 h-5 w-5" />
                            Blockchain Dashboard
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : isGeneratingFighter ? (
                    <div className="space-y-4">
                      <p className="text-gray-300">Generating your fighter...</p>
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-300">Get your first fighter to start playing!</p>
                      <Button 
                        onClick={generateDemoFighter}
                        className="w-full py-3 text-lg"
                        variant="outline"
                      >
                        Generate Fighter
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Player Fighter Section */}
      {isConnected && playerFighter && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 text-white font-game">Your Champion</h2>
              <p className="text-gray-300 text-lg">Meet your battle-ready fighter</p>
            </motion.div>
            
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="max-w-sm"
              >
                <FighterCard 
                  fighter={playerFighter} 
                  className="glow-effect"
                  glowEffect={true}
                  size="lg"
                />
              </motion.div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
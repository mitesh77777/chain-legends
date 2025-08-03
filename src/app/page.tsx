'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-16"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Swords className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Chain Legends
              </h1>
            </div>
            
            <WalletConnect className="z-10" />
          </motion.div>

          {/* Main Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Battle.<br />
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Collect.
                  </span><br />
                  <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                    Dominate.
                  </span>
                </h2>
                
                <p className="text-xl text-gray-300 mb-8 max-w-lg">
                  The ultimate Web3 battle arena where your NFT fighters evolve, 
                  battle, and earn rewards on the blockchain.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isConnected ? (
                  playerFighter ? (
                    <Button 
                      size="lg" 
                      variant="game"
                      onClick={handleStartBattle}
                      className="text-lg px-8 py-4"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Start Battle
                    </Button>
                  ) : isGeneratingFighter ? (
                    <Button 
                      size="lg" 
                      disabled
                      className="text-lg px-8 py-4"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Zap className="h-5 w-5" />
                      </motion.div>
                      Summoning Fighter...
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      variant="game"
                      onClick={generateDemoFighter}
                      className="text-lg px-8 py-4"
                    >
                      <Star className="mr-2 h-5 w-5" />
                      Summon Fighter
                    </Button>
                  )
                ) : (
                  <div className="flex flex-col gap-2">
                    <WalletConnect className="text-lg px-8 py-4" />
                    <p className="text-sm text-gray-400">
                      Connect your wallet to start playing
                    </p>
                  </div>
                )}
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-4"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  View Leaderboard
                </Button>
              </div>
            </motion.div>

            {/* Right Side - Fighter Display or Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              {playerFighter ? (
                <FighterCard
                  fighter={playerFighter}
                  size="lg"
                  glowEffect={true}
                  interactive={true}
                  className="transform hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Card className="fighter-card w-80 h-96 border-dashed border-2 border-gray-600 bg-gray-800/20">
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-gray-700/50 flex items-center justify-center mb-4">
                      <Gamepad2 className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      Your Fighter Awaits
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {isConnected 
                        ? 'Summon your first fighter to begin your legend'
                        : 'Connect your wallet to summon a fighter'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 text-center">
                <CardContent className="p-6">
                  <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">
            Game Features
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience the future of gaming with blockchain-powered battles, 
            true ownership of your fighters, and competitive tournaments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <Card className="bg-gray-800/50 border-gray-700 h-full">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Swords className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-400">© 2024 Chain Legends. All rights reserved.</span>
            </div>
            
            <div className="flex gap-4">
              <Badge variant="outline">Powered by Etherlink</Badge>
              <Badge variant="outline">Built with Thirdweb</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
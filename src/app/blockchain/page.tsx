'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NFTFighterManager } from '@/components/game/NFTFighterManager'
import { TokenRewardsSystem } from '@/components/game/TokenRewardsSystem'
import { BlockchainBattle } from '@/components/game/BlockchainBattle'
import { useWallet } from '@/components/wallet/WalletProvider'
import { Fighter, Element } from '@/types/game'
import { generateRandomName, generateId } from '@/lib/utils'
import { BattleEngine } from '@/lib/battle-engine'
import { 
  Link2, 
  Coins, 
  Trophy, 
  Swords, 
  Star, 
  TrendingUp, 
  Users,
  Zap,
  Crown,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function BlockchainPage() {
  const { isConnected, address } = useWallet()
  const [selectedFighters, setSelectedFighters] = useState<{
    player?: Fighter
    opponent?: Fighter
  }>({})
  const [activeTab, setActiveTab] = useState('overview')

  // Generate demo fighters for blockchain battle
  const generateDemoFighters = () => {
    const playerElement = Math.floor(Math.random() * 4) as Element
    const opponentElement = Math.floor(Math.random() * 4) as Element
    
    const playerStats = BattleEngine.generateFighterStats(playerElement, 2)
    const opponentStats = BattleEngine.generateFighterStats(opponentElement, 2)
    
    const player: Fighter = {
      id: generateId(),
      tokenId: '1001',
      name: generateRandomName(),
      element: playerElement,
      level: 2,
      experience: 100,
      wins: 5,
      losses: 2,
      health: playerStats.health,
      maxHealth: playerStats.health,
      attack: playerStats.attack,
      defense: playerStats.defense,
      speed: playerStats.speed,
      lastBattle: Date.now(),
      owner: address || 'player',
      imageUrl: '/fighters/default.png'
    }
    
    const opponent: Fighter = {
      id: generateId(),
      tokenId: '1002',
      name: generateRandomName(),
      element: opponentElement,
      level: 2,
      experience: 100,
      wins: 4,
      losses: 3,
      health: opponentStats.health,
      maxHealth: opponentStats.health,
      attack: opponentStats.attack,
      defense: opponentStats.defense,
      speed: opponentStats.speed,
      lastBattle: Date.now(),
      owner: 'opponent',
      imageUrl: '/fighters/default.png'
    }
    
    setSelectedFighters({ player, opponent })
    setActiveTab('battle')
  }

  const statsCards = [
    {
      title: 'NFT Fighters',
      value: '12',
      change: '+3 this week',
      icon: Star,
      color: 'text-purple-400',
      bgColor: 'from-purple-900/50 to-purple-800/50',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'LEGEND Tokens',
      value: '2,847',
      change: '+125 today',
      icon: Coins,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-900/50 to-yellow-800/50',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: 'Battle Wins',
      value: '47',
      change: '+8 this week',
      icon: Trophy,
      color: 'text-blue-400',
      bgColor: 'from-blue-900/50 to-blue-800/50',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Chain Rank',
      value: 'Gold',
      change: 'Top 15%',
      icon: Crown,
      color: 'text-orange-400',
      bgColor: 'from-orange-900/50 to-orange-800/50',
      borderColor: 'border-orange-500/30'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Game
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Link2 className="h-8 w-8 text-purple-400" />
                Blockchain Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Manage your NFT fighters, earn tokens, and battle on-chain
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="bg-green-900/50 text-green-400 border-green-500/50">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Etherlink Testnet
            </Badge>
            {isConnected && (
              <Badge variant="outline" className="text-purple-400 border-purple-500/50">
                Connected
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Card className="bg-gray-900/50 border-gray-700 max-w-md mx-auto">
              <CardContent className="p-8">
                                <Link2 className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-400 mb-6">
                  Connect your wallet to access blockchain features, manage NFT fighters, and earn LEGEND tokens.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Star className="h-4 w-4 text-purple-400" />
                    Mint and manage NFT fighters
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    Earn LEGEND tokens from battles
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Swords className="h-4 w-4 text-red-400" />
                    Participate in blockchain battles
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card className={cn(
                    'bg-gradient-to-br',
                    stat.bgColor,
                    stat.borderColor,
                    'border'
                  )}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">{stat.title}</p>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className={cn('text-xs', stat.color)}>{stat.change}</p>
                        </div>
                        <stat.icon className={cn('h-8 w-8', stat.color)} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Main Content Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border-gray-700">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="fighters"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    NFT Fighters
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rewards"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    Rewards
                  </TabsTrigger>
                  <TabsTrigger 
                    value="battle"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Battle
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <Card className="bg-gray-900/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-400" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          onClick={() => setActiveTab('fighters')}
                          className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Mint New Fighter
                        </Button>
                        <Button 
                          onClick={generateDemoFighters}
                          className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                        >
                          <Swords className="mr-2 h-4 w-4" />
                          Start Blockchain Battle
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('rewards')}
                          className="w-full justify-start bg-green-600 hover:bg-green-700"
                        >
                          <Coins className="mr-2 h-4 w-4" />
                          Claim Rewards
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="bg-gray-900/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-400" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                            <span className="text-gray-300">Fighter minted</span>
                            <span className="text-purple-400">2h ago</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                            <span className="text-gray-300">Battle won (+100 LEGEND)</span>
                            <span className="text-green-400">4h ago</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                            <span className="text-gray-300">Rewards claimed</span>
                            <span className="text-yellow-400">1d ago</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="fighters">
                  <NFTFighterManager />
                </TabsContent>

                <TabsContent value="rewards">
                  <TokenRewardsSystem />
                </TabsContent>

                <TabsContent value="battle">
                  {selectedFighters.player && selectedFighters.opponent ? (
                    <BlockchainBattle
                      playerFighter={selectedFighters.player}
                      opponentFighter={selectedFighters.opponent}
                      onBattleComplete={(winner, rewards) => {
                        console.log('Battle completed:', { winner, rewards })
                        // Refresh data or show completion message
                      }}
                    />
                  ) : (
                    <Card className="bg-gray-900/50 border-gray-700">
                      <CardContent className="p-8 text-center">
                        <Swords className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Ready for Battle?</h3>
                        <p className="text-gray-400 mb-6">
                          Generate demo fighters to start a blockchain battle
                        </p>
                        <Button 
                          onClick={generateDemoFighters}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Swords className="mr-2 h-4 w-4" />
                          Generate Demo Battle
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

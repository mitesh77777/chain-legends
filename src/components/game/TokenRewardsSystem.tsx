'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@/components/wallet/WalletProvider'
import { 
  getTokenBalance, 
  getPlayerFighters,
  formatTokenAmount 
} from '@/lib/contracts'
import { 
  Coins, 
  Trophy, 
  Star, 
  Gift, 
  Zap, 
  Calendar, 
  Target,
  TrendingUp,
  Crown,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RewardTask {
  id: string
  title: string
  description: string
  reward: number
  progress: number
  maxProgress: number
  completed: boolean
  type: 'daily' | 'weekly' | 'achievement'
  icon: React.ReactNode
}

interface TokenStats {
  balance: number
  totalEarned: number
  dailyEarned: number
  weeklyEarned: number
  battlesWon: number
  fightersOwned: number
  rank: string
  nextRankRequirement: number
}

export function TokenRewardsSystem() {
  const { isConnected, address } = useWallet()
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    balance: 0,
    totalEarned: 0,
    dailyEarned: 0,
    weeklyEarned: 0,
    battlesWon: 0,
    fightersOwned: 0,
    rank: 'Bronze',
    nextRankRequirement: 1000
  })
  const [rewardTasks, setRewardTasks] = useState<RewardTask[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [claimingRewards, setClaimingRewards] = useState<string[]>([])

  useEffect(() => {
    if (isConnected && address) {
      loadTokenData()
      generateRewardTasks()
    }
  }, [isConnected, address])

  const loadTokenData = async () => {
    if (!address) return
    
    setIsLoading(true)
    try {
      const balance = await getTokenBalance(address)
      const fighters = await getPlayerFighters(address)
      
      // In a real app, these would come from contract events or database
      const mockStats: TokenStats = {
        balance,
        totalEarned: balance + Math.floor(Math.random() * 1000),
        dailyEarned: Math.floor(Math.random() * 100),
        weeklyEarned: Math.floor(Math.random() * 500),
        battlesWon: Math.floor(Math.random() * 20),
        fightersOwned: fighters.length,
        rank: getRank(balance),
        nextRankRequirement: getNextRankRequirement(balance)
      }
      
      setTokenStats(mockStats)
    } catch (error) {
      console.error('Error loading token data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRewardTasks = () => {
    const tasks: RewardTask[] = [
      // Daily Tasks
      {
        id: 'daily-battle',
        title: 'Daily Battle',
        description: 'Win 3 battles today',
        reward: 50,
        progress: Math.floor(Math.random() * 3),
        maxProgress: 3,
        completed: false,
        type: 'daily',
        icon: <Trophy className="h-4 w-4 text-yellow-400" />
      },
      {
        id: 'daily-login',
        title: 'Daily Login',
        description: 'Log in today',
        reward: 25,
        progress: 1,
        maxProgress: 1,
        completed: true,
        type: 'daily',
        icon: <Calendar className="h-4 w-4 text-blue-400" />
      },
      {
        id: 'daily-mint',
        title: 'Mint Fighter',
        description: 'Mint a new fighter today',
        reward: 100,
        progress: 0,
        maxProgress: 1,
        completed: false,
        type: 'daily',
        icon: <Star className="h-4 w-4 text-purple-400" />
      },
      
      // Weekly Tasks
      {
        id: 'weekly-battles',
        title: 'Battle Master',
        description: 'Win 15 battles this week',
        reward: 300,
        progress: Math.floor(Math.random() * 15),
        maxProgress: 15,
        completed: false,
        type: 'weekly',
        icon: <Flame className="h-4 w-4 text-red-400" />
      },
      {
        id: 'weekly-collection',
        title: 'Collector',
        description: 'Own 5 different fighters',
        reward: 200,
        progress: tokenStats.fightersOwned,
        maxProgress: 5,
        completed: tokenStats.fightersOwned >= 5,
        type: 'weekly',
        icon: <Crown className="h-4 w-4 text-purple-400" />
      },
      
      // Achievement Tasks
      {
        id: 'achievement-streak',
        title: 'Win Streak',
        description: 'Win 10 battles in a row',
        reward: 500,
        progress: Math.floor(Math.random() * 10),
        maxProgress: 10,
        completed: false,
        type: 'achievement',
        icon: <TrendingUp className="h-4 w-4 text-green-400" />
      }
    ]
    
    setRewardTasks(tasks.map(task => ({
      ...task,
      completed: task.progress >= task.maxProgress
    })))
  }

  const getRank = (balance: number): string => {
    if (balance >= 10000) return 'Diamond'
    if (balance >= 5000) return 'Platinum'
    if (balance >= 2000) return 'Gold'
    if (balance >= 1000) return 'Silver'
    return 'Bronze'
  }

  const getNextRankRequirement = (balance: number): number => {
    if (balance >= 10000) return 0
    if (balance >= 5000) return 10000
    if (balance >= 2000) return 5000
    if (balance >= 1000) return 2000
    return 1000
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Diamond': return 'from-cyan-400 to-blue-600'
      case 'Platinum': return 'from-gray-300 to-gray-600'
      case 'Gold': return 'from-yellow-400 to-yellow-600'
      case 'Silver': return 'from-gray-400 to-gray-500'
      default: return 'from-orange-400 to-orange-600'
    }
  }

  const claimReward = async (taskId: string) => {
    setClaimingRewards(prev => [...prev, taskId])
    
    // Simulate claiming reward
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const task = rewardTasks.find(t => t.id === taskId)
    if (task) {
      // Update token balance
      setTokenStats(prev => ({
        ...prev,
        balance: prev.balance + task.reward,
        totalEarned: prev.totalEarned + task.reward,
        dailyEarned: task.type === 'daily' ? prev.dailyEarned + task.reward : prev.dailyEarned,
        weeklyEarned: task.type === 'weekly' ? prev.weeklyEarned + task.reward : prev.weeklyEarned
      }))
      
      // Mark task as claimed
      setRewardTasks(prev => prev.filter(t => t.id !== taskId))
    }
    
    setClaimingRewards(prev => prev.filter(id => id !== taskId))
  }

  const completedTasks = rewardTasks.filter(task => task.completed && !claimingRewards.includes(task.id))
  const uncompletedTasks = rewardTasks.filter(task => !task.completed)

  if (!isConnected) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-8 text-center">
          <Coins className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
          <p className="text-gray-400">
            Connect your wallet to view rewards and earn LEGEND tokens
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Token Stats Overview */}
      <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-400" />
            LEGEND Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {formatTokenAmount(tokenStats.balance)}
              </div>
              <div className="text-xs text-gray-400">Current Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatTokenAmount(tokenStats.totalEarned)}
              </div>
              <div className="text-xs text-gray-400">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {formatTokenAmount(tokenStats.dailyEarned)}
              </div>
              <div className="text-xs text-gray-400">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {formatTokenAmount(tokenStats.weeklyEarned)}
              </div>
              <div className="text-xs text-gray-400">This Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rank Progress */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-400" />
            Player Rank
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={cn('px-3 py-1 bg-gradient-to-r', getRankColor(tokenStats.rank))}>
                {tokenStats.rank} Rank
              </Badge>
              {tokenStats.nextRankRequirement > 0 && (
                <span className="text-sm text-gray-400">
                  {formatTokenAmount(tokenStats.nextRankRequirement - tokenStats.balance)} to next rank
                </span>
              )}
            </div>
            
            {tokenStats.nextRankRequirement > 0 && (
              <div>
                <Progress 
                  value={(tokenStats.balance / tokenStats.nextRankRequirement) * 100}
                  className="h-3"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Tasks - Ready to Claim */}
      {completedTasks.length > 0 && (
        <Card className="bg-green-900/20 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-400" />
              Ready to Claim ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-4 bg-green-900/30 border border-green-500/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {task.icon}
                    <div>
                      <div className="font-semibold text-green-300">{task.title}</div>
                      <div className="text-sm text-gray-400">{task.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-400">
                        +{task.reward} LEGEND
                      </div>
                      <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                        {task.type}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => claimReward(task.id)}
                      disabled={claimingRewards.includes(task.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {claimingRewards.includes(task.id) ? 'Claiming...' : 'Claim'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Progress */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Tasks & Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['daily', 'weekly', 'achievement'].map((type) => (
              <div key={type}>
                <h4 className="text-sm font-semibold text-gray-300 mb-3 capitalize">
                  {type} {type === 'achievement' ? 'Tasks' : 'Challenges'}
                </h4>
                <div className="space-y-3">
                  {uncompletedTasks
                    .filter(task => task.type === type)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {task.icon}
                          <div className="flex-1">
                            <div className="font-medium text-white">{task.title}</div>
                            <div className="text-sm text-gray-400">{task.description}</div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>{task.progress}/{task.maxProgress}</span>
                                <span>{Math.round((task.progress / task.maxProgress) * 100)}%</span>
                              </div>
                              <Progress 
                                value={(task.progress / task.maxProgress) * 100}
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-yellow-400">
                            {task.reward} LEGEND
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

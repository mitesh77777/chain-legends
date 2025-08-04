'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BattleArena } from './BattleArena'
import { useActiveAccount } from 'thirdweb/react'
import { 
  createBattle, 
  submitBattleResult, 
  getBattle,
  claimBattleRewards,
  generateBattleHash,
  getTransactionExplorerUrl 
} from '@/lib/contracts'
import { Fighter, BattleAction, BattleState, BattleStatus } from '@/types/game'
import { 
  Coins, 
  Trophy, 
  Zap, 
  Link2, 
  CheckCircle, 
  Clock, 
  Loader2,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlockchainBattleProps {
  playerFighter: Fighter
  opponentFighter: Fighter
  onBattleComplete?: (winner: 'player1' | 'player2' | null, rewards: number) => void
}

interface BattleTransaction {
  id: string
  type: 'create' | 'submit' | 'claim'
  status: 'pending' | 'confirmed' | 'failed'
  hash?: string
  timestamp: number
}

export function BlockchainBattle({ 
  playerFighter, 
  opponentFighter, 
  onBattleComplete 
}: BlockchainBattleProps) {
  const account = useActiveAccount()
  const isConnected = !!account
  const address = account?.address
  const [battleId, setBattleId] = useState<number | null>(null)
  const [battleState, setBattleState] = useState<BattleState | null>(null)
  const [transactions, setTransactions] = useState<BattleTransaction[]>([])
  const [isCreatingBattle, setIsCreatingBattle] = useState(false)
  const [isSubmittingResult, setIsSubmittingResult] = useState(false)
  const [isClaimingRewards, setIsClaimingRewards] = useState(false)
  const [battleRewards, setBattleRewards] = useState(0)
  const [canClaimRewards, setCanClaimRewards] = useState(false)

  // Create blockchain battle when component mounts
  useEffect(() => {
    if (isConnected && address && !battleId) {
      createBlockchainBattle()
    }
  }, [isConnected, address])

  const addTransaction = (transaction: Omit<BattleTransaction, 'timestamp'>) => {
    const newTransaction: BattleTransaction = {
      ...transaction,
      timestamp: Date.now()
    }
    setTransactions(prev => [...prev, newTransaction])
    return newTransaction.id
  }

  const updateTransaction = (id: string, updates: Partial<BattleTransaction>) => {
    setTransactions(prev => 
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    )
  }

  const createBlockchainBattle = async () => {
    if (!address || !account) return
    
    setIsCreatingBattle(true)
    const txId = addTransaction({
      id: `create-${Date.now()}`,
      type: 'create',
      status: 'pending'
    })

    try {
      // Create battle on blockchain
      const result = await createBattle(
        account,
        parseInt(playerFighter.tokenId),
        parseInt(opponentFighter.tokenId),
        0 // Entry fee in wei
      )
      
      updateTransaction(txId, {
        status: 'confirmed',
        hash: result
      })
      
      // Extract battle ID from transaction receipt
      // In a real implementation, you'd parse the event logs
      const newBattleId = Math.floor(Math.random() * 10000) + 1
      setBattleId(newBattleId)
      
      console.log('Blockchain battle created:', newBattleId)
    } catch (error) {
      console.error('Error creating blockchain battle:', error)
      updateTransaction(txId, { status: 'failed' })
    } finally {
      setIsCreatingBattle(false)
    }
  }

  const handleBattleEnd = async (winner: 'player1' | 'player2' | null, battleData: BattleState) => {
    if (!battleId || !address || !account) return
    
    setBattleState(battleData)
    setIsSubmittingResult(true)
    
    const txId = addTransaction({
      id: `submit-${Date.now()}`,
      type: 'submit',
      status: 'pending'
    })

    try {
      // Calculate rewards based on battle result
      const baseReward = 50
      const winnerReward = winner === 'player1' ? baseReward * 2 : baseReward
      setBattleRewards(winnerReward)
      
      // Submit battle result to blockchain
      const winnerId = winner === 'player1' 
        ? parseInt(playerFighter.tokenId)
        : parseInt(opponentFighter.tokenId)
      const loserId = winner === 'player1' 
        ? parseInt(opponentFighter.tokenId)
        : parseInt(playerFighter.tokenId)
      
      const battleHash = generateBattleHash(battleData)
      const result = await submitBattleResult(
        account,
        battleId,
        winnerId,
        loserId,
        battleHash
      )
      
      updateTransaction(txId, {
        status: 'confirmed',
        hash: result
      })
      
      setCanClaimRewards(true)
      console.log('Battle result submitted to blockchain')
    } catch (error) {
      console.error('Error submitting battle result:', error)
      updateTransaction(txId, { status: 'failed' })
    } finally {
      setIsSubmittingResult(false)
    }
  }

  const claimRewards = async () => {
    if (!battleId || !address || !account) return
    
    setIsClaimingRewards(true)
    const txId = addTransaction({
      id: `claim-${Date.now()}`,
      type: 'claim',
      status: 'pending'
    })

    try {
      const result = await claimBattleRewards(account, battleId)
      
      updateTransaction(txId, {
        status: 'confirmed',
        hash: result
      })
      
      setCanClaimRewards(false)
      
      if (onBattleComplete) {
        const winner = battleState?.winner || null
        onBattleComplete(winner, battleRewards)
      }
      
      console.log('Rewards claimed successfully')
    } catch (error) {
      console.error('Error claiming rewards:', error)
      updateTransaction(txId, { status: 'failed' })
    } finally {
      setIsClaimingRewards(false)
    }
  }

  const getStatusIcon = (status: BattleTransaction['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <div className="h-4 w-4 rounded-full bg-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: BattleTransaction['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400'
      case 'confirmed': return 'text-green-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-8 text-center">
          <Link2 className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Wallet Required</h3>
          <p className="text-gray-400">
            Connect your wallet to participate in blockchain battles
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Blockchain Status */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-purple-400" />
            Blockchain Battle
            {battleId && (
              <Badge variant="outline" className="text-xs">
                Battle #{battleId}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isCreatingBattle && (
              <motion.div 
                className="flex items-center gap-2 text-yellow-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Creating battle on blockchain...</span>
              </motion.div>
            )}
            
            {battleId && !battleState && (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Battle created successfully!</span>
              </div>
            )}
            
            {isSubmittingResult && (
              <motion.div 
                className="flex items-center gap-2 text-yellow-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Submitting battle result...</span>
              </motion.div>
            )}
            
            {canClaimRewards && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-green-300 font-semibold">
                      Rewards Ready: {battleRewards} LEGEND
                    </span>
                  </div>
                  <Button
                    onClick={claimRewards}
                    disabled={isClaimingRewards}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isClaimingRewards ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Coins className="mr-1 h-3 w-3" />
                        Claim
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <span className="text-sm text-gray-300">
                      {tx.type === 'create' && 'Create Battle'}
                      {tx.type === 'submit' && 'Submit Result'}
                      {tx.type === 'claim' && 'Claim Rewards'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs', getStatusColor(tx.status))}>
                      {tx.status}
                    </span>
                    {tx.hash && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(getTransactionExplorerUrl(tx.hash!), '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Battle Arena */}
      {battleId && !isCreatingBattle && (
        <BattleArena
          roomId={`blockchain-${battleId}`}
          playerFighter={playerFighter}
          opponentFighter={opponentFighter}
          onBattleEnd={handleBattleEnd}
          className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20"
        />
      )}
    </div>
  )
}

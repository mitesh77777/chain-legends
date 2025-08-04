'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BattleArena } from '@/components/game/BattleArena'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConnectButton, useActiveAccount, useActiveWallet } from 'thirdweb/react'
import { Fighter, Element, BattleAction, BattleState } from '@/types/game'
import { BattleEngine } from '@/lib/battle-engine'
import { 
  getPlayerFighters, 
  createBattle, 
  submitBattleResult, 
  getTokenBalance,
  generateBattleHash,
  formatTokenAmount,
  client,
  etherlinkTestnet
} from '@/lib/contracts'
import { generateRandomName, generateId } from '@/lib/utils'
import { 
  ArrowLeft, 
  RotateCcw, 
  Coins, 
  Trophy, 
  Swords,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

interface BattleTransaction {
  type: 'create' | 'submit' | 'reward'
  status: 'pending' | 'success' | 'error'
  hash?: string
  message: string
}

function OnChainBattleContent() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const isConnected = !!account
  const address = account?.address

  // Battle state
  const [playerFighter, setPlayerFighter] = useState<Fighter | null>(null)
  const [opponentFighter, setOpponentFighter] = useState<Fighter | null>(null)
  const [battleKey, setBattleKey] = useState(0)
  
  // Blockchain state
  const [userFighters, setUserFighters] = useState<Fighter[]>([])
  const [tokenBalance, setTokenBalance] = useState(0)
  const [selectedFighterId, setSelectedFighterId] = useState<string>('')
  const [entryFee, setEntryFee] = useState(10) // LEGEND tokens
  const [battleId, setBattleId] = useState<number | null>(null)
  
  // UI state
  const [showFighterSelect, setShowFighterSelect] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<BattleTransaction[]>([])
  const [battlePhase, setBattlePhase] = useState<'select' | 'creating' | 'battling' | 'submitting' | 'complete'>('select')

  useEffect(() => {
    if (isConnected && address) {
      loadUserData()
    }
  }, [isConnected, address])

  const loadUserData = async () => {
    if (!address) return
    
    setIsLoading(true)
    try {
      const [fighters, balance] = await Promise.all([
        getPlayerFighters(address),
        getTokenBalance(address)
      ])
      
      setUserFighters(fighters)
      setTokenBalance(balance)
      
      if (fighters.length > 0 && !selectedFighterId) {
        setSelectedFighterId(fighters[0].id)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      addTransaction('error', 'Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  const addTransaction = (status: BattleTransaction['status'], message: string, hash?: string) => {
    const transaction: BattleTransaction = {
      type: 'create', // Will be set properly based on context
      status,
      hash,
      message
    }
    setTransactions(prev => [...prev, transaction])
  }

  const generateOpponentFighter = (playerLevel: number): Fighter => {
    const opponentElement = Math.floor(Math.random() * 4) as Element
    const opponentLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1)
    const opponentStats = BattleEngine.generateFighterStats(opponentElement, opponentLevel)
    
    return {
      id: generateId(),
      tokenId: '9999',
      name: generateRandomName(),
      element: opponentElement,
      level: opponentLevel,
      experience: (opponentLevel - 1) * 100,
      wins: Math.floor(Math.random() * 10),
      losses: Math.floor(Math.random() * 5),
      health: opponentStats.health,
      maxHealth: opponentStats.health,
      attack: opponentStats.attack,
      defense: opponentStats.defense,
      speed: opponentStats.speed,
      lastBattle: Date.now(),
      owner: 'ai',
      imageUrl: '/fighters/default.png'
    }
  }

  const handleStartBattle = async () => {
    if (!address || !selectedFighterId) {
      addTransaction('error', 'Please select a fighter first')
      return
    }

    const selectedFighter = userFighters.find(f => f.id === selectedFighterId)
    if (!selectedFighter) {
      addTransaction('error', 'Selected fighter not found')
      return
    }

    if (tokenBalance < entryFee) {
      addTransaction('error', `Insufficient tokens! Need ${entryFee} LEGEND tokens`)
      return
    }

    setBattlePhase('creating')
    setIsLoading(true)

    try {
      // Generate opponent
      const opponent = generateOpponentFighter(selectedFighter.level)
      
      // Create battle on-chain
      addTransaction('pending', 'Creating battle on blockchain...')
      const txHash = await createBattle(
        account!,
        parseInt(selectedFighter.tokenId),
        parseInt(opponent.tokenId),
        entryFee
      )
      
      addTransaction('success', 'Battle created successfully!', txHash)
      
      // Set fighters for battle
      setPlayerFighter(selectedFighter)
      setOpponentFighter(opponent)
      setBattleId(Date.now()) // In real app, get from contract event
      setBattlePhase('battling')
      
    } catch (error) {
      console.error('Error creating battle:', error)
      addTransaction('error', 'Failed to create battle')
      setBattlePhase('select')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBattleEnd = async (winner: 'player1' | 'player2' | null, battleData: BattleState) => {
    if (!battleId || !playerFighter || !opponentFighter || !account) return

    setBattlePhase('submitting')
    setIsLoading(true)

    try {
      addTransaction('pending', 'Submitting battle results...')
      
      // Determine winner/loser
      const winnerId = winner === 'player1' 
        ? parseInt(playerFighter.tokenId) 
        : parseInt(opponentFighter.tokenId)
      const loserId = winner === 'player1' 
        ? parseInt(opponentFighter.tokenId) 
        : parseInt(playerFighter.tokenId)
      
      // Generate battle data hash
      const battleHash = generateBattleHash({
        battleId,
        winner,
        turnNumber: battleData.turnNumber,
        playerActions: battleData.actions.filter(a => a.playerId === 'player1'),
        finalState: battleData
      })
      
      // Submit to blockchain
      const txHash = await submitBattleResult(
        account,
        battleId,
        winnerId,
        loserId,
        battleHash
      )
      
      addTransaction('success', 'Battle results submitted!', txHash)
      
      // Calculate rewards
      const rewardAmount = winner === 'player1' ? entryFee * 1.8 : 0 // 80% return + opponent's fee
      
      if (rewardAmount > 0) {
        addTransaction('success', `🎉 You won ${formatTokenAmount(rewardAmount)} LEGEND tokens!`)
      }
      
      setBattlePhase('complete')
      
      // Refresh user data
      await loadUserData()
      
    } catch (error) {
      console.error('Error submitting battle:', error)
      addTransaction('error', 'Failed to submit battle results')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewBattle = () => {
    setPlayerFighter(null)
    setOpponentFighter(null)
    setBattleId(null)
    setBattlePhase('select')
    setTransactions([])
    setBattleKey(prev => prev + 1)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Card className="w-96 bg-gray-800/80 border-gray-600">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Connect Wallet</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300 mb-4">
              Connect your wallet to start battling on-chain!
            </p>
            <ConnectButton
              client={client}
              chain={etherlinkTestnet}
              connectButton={{
                label: "Connect Wallet",
                style: {
                  width: "100%",
                  backgroundColor: "#8B5CF6",
                  color: "white",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer"
                }
              }}
            />
            <div className="pt-4">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Go to Home Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (battlePhase === 'select' || !playerFighter || !opponentFighter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-white border-white">
                <Coins className="w-4 h-4 mr-1" />
                {formatTokenAmount(tokenBalance)} LEGEND
              </Badge>
              <Badge variant="outline" className="text-white border-white">
                {userFighters.length} Fighters
              </Badge>
            </div>
          </div>

          {/* Battle Setup */}
          <Card className="bg-gray-800/80 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Swords className="w-6 h-6 mr-2" />
                On-Chain Battle Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {userFighters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300 mb-4">
                    You need to mint a fighter first!
                  </p>
                  <Link href="/blockchain">
                    <Button>
                      Mint Your First Fighter
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Fighter Selection */}
                  <div>
                    <h3 className="text-white text-lg mb-3">Select Your Fighter</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userFighters.map(fighter => (
                        <Card 
                          key={fighter.id}
                          className={`cursor-pointer transition-all border-2 ${
                            selectedFighterId === fighter.id 
                              ? 'border-purple-400 bg-purple-900/20' 
                              : 'border-gray-600 bg-gray-800/50'
                          }`}
                          onClick={() => setSelectedFighterId(fighter.id)}
                        >
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h4 className="text-white font-semibold">{fighter.name}</h4>
                              <p className="text-gray-300 text-sm">Level {fighter.level}</p>
                              <div className="flex justify-center mt-2 gap-2">
                                <Badge variant="outline" className="text-xs">
                                  ATK: {fighter.attack}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  DEF: {fighter.defense}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  SPD: {fighter.speed}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Entry Fee */}
                  <div>
                    <h3 className="text-white text-lg mb-3">Entry Fee</h3>
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={entryFee}
                        onChange={(e) => setEntryFee(Number(e.target.value))}
                        min="1"
                        max={tokenBalance}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                      <span className="text-gray-300">LEGEND tokens</span>
                      <Badge className="bg-green-600">
                        Win: {formatTokenAmount(entryFee * 1.8)} tokens
                      </Badge>
                    </div>
                  </div>

                  {/* Start Battle Button */}
                  <Button 
                    onClick={handleStartBattle}
                    disabled={!selectedFighterId || tokenBalance < entryFee || isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Battle...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Start On-Chain Battle ({entryFee} LEGEND)
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Transaction Status */}
          {transactions.length > 0 && (
            <Card className="mt-6 bg-gray-800/80 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Transaction Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {tx.status === 'pending' && (
                        <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                      )}
                      {tx.status === 'success' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      {tx.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      
                      <span className={`text-sm ${
                        tx.status === 'pending' ? 'text-yellow-300' :
                        tx.status === 'success' ? 'text-green-300' :
                        'text-red-300'
                      }`}>
                        {tx.message}
                      </span>
                      
                      {tx.hash && (
                        <a 
                          href={`https://testnet.explorer.etherlink.com/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          View TX
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Battle Arena View
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header during battle */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Badge className="bg-green-600">
            Battle ID: {battleId}
          </Badge>
          <Badge variant="outline" className="text-white border-white">
            Entry: {entryFee} LEGEND
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          {battlePhase === 'complete' && (
            <Button onClick={handleNewBattle}>
              <RotateCcw className="w-4 h-4 mr-2" />
              New Battle
            </Button>
          )}
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Battle Arena */}
      <BattleArena
        key={battleKey}
        roomId={`battle-${battleId}`}
        playerFighter={playerFighter}
        opponentFighter={opponentFighter}
        onBattleEnd={handleBattleEnd}
        isPlayerTurn={true}
      />

      {/* Transaction Status during battle */}
      {transactions.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80">
          <Card className="bg-gray-800/90 border-gray-600">
            <CardContent className="p-4">
              <div className="space-y-2">
                {transactions.slice(-3).map((tx, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {tx.status === 'pending' && (
                      <Loader2 className="w-3 h-3 animate-spin text-yellow-400" />
                    )}
                    {tx.status === 'success' && (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    )}
                    {tx.status === 'error' && (
                      <AlertCircle className="w-3 h-3 text-red-400" />
                    )}
                    
                    <span className={`${
                      tx.status === 'pending' ? 'text-yellow-300' :
                      tx.status === 'success' ? 'text-green-300' :
                      'text-red-300'
                    }`}>
                      {tx.message}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Export as dynamic component to avoid SSR issues
const OnChainBattlePage = dynamic(() => Promise.resolve(OnChainBattleContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-white">Loading blockchain battle...</p>
      </div>
    </div>
  )
})

export default OnChainBattlePage

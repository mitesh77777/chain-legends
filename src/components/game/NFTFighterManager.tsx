'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FighterCard } from './FighterCard'
import { useActiveAccount } from 'thirdweb/react'
import { 
  mintFighter, 
  getPlayerFighters, 
  getTokenBalance,
  formatTokenAmount, 
  getElementName, 
  calculateMintCost 
} from '@/lib/contracts'
import { Fighter, Element } from '@/types/game'
import { generateRandomName } from '@/lib/utils'
import { 
  Plus, 
  Coins, 
  Sparkles, 
  Trophy, 
  Zap, 
  Flame, 
  Droplets, 
  Mountain, 
  Wind,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function NFTFighterManager() {
  const account = useActiveAccount()
  const isConnected = !!account
  const address = account?.address
  const [nftFighters, setNftFighters] = useState<Fighter[]>([])
  const [tokenBalance, setTokenBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [selectedElement, setSelectedElement] = useState<Element>(Element.FIRE)
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [showMintDialog, setShowMintDialog] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      loadUserData()
    }
  }, [isConnected, address])

  const loadUserData = async () => {
    if (!address) return
    
    setIsLoading(true)
    try {
      // Load user's NFT fighters
      const fighters = await getPlayerFighters(address)
      setNftFighters(fighters)
      
      // Load token balance
      const balance = await getTokenBalance(address)
      setTokenBalance(balance)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMintFighter = async () => {
    if (!address) return
    
    const mintCost = calculateMintCost(selectedLevel)
    if (tokenBalance < mintCost) {
      alert(`Insufficient tokens! You need ${mintCost} LEGEND tokens to mint this fighter.`)
      return
    }
    
    setIsMinting(true)
    try {
      const name = generateRandomName()
      const result = await mintFighter(
        account!,
        selectedElement,
        selectedLevel,
        name,
        'https://placeholder-fighter.png'
      )
      console.log('Fighter minted:', result)
      
      // Refresh user data after minting
      await loadUserData()
      setShowMintDialog(false)
      
      // Show success message
      alert('Fighter minted successfully! Check your collection.')
    } catch (error) {
      console.error('Error minting fighter:', error)
      alert('Failed to mint fighter. Please try again.')
    } finally {
      setIsMinting(false)
    }
  }

  const getElementIcon = (element: Element) => {
    switch (element) {
      case Element.FIRE: return <Flame className="h-4 w-4 text-red-400" />
      case Element.WATER: return <Droplets className="h-4 w-4 text-blue-400" />
      case Element.EARTH: return <Mountain className="h-4 w-4 text-green-400" />
      case Element.AIR: return <Wind className="h-4 w-4 text-purple-400" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getElementColor = (element: Element) => {
    switch (element) {
      case Element.FIRE: return 'from-red-600 to-orange-600'
      case Element.WATER: return 'from-blue-600 to-cyan-600'
      case Element.EARTH: return 'from-green-600 to-emerald-600'
      case Element.AIR: return 'from-purple-600 to-violet-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <Sparkles className="h-12 w-12 text-purple-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Connect Your Wallet</h3>
            <p className="text-gray-400">
              Connect your wallet to view and manage your NFT fighters
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Balance */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-6 w-6 text-purple-400" />
                NFT Fighter Collection
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your blockchain-verified fighters
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-lg font-bold text-yellow-400">
                  {formatTokenAmount(tokenBalance)} LEGEND
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {nftFighters.length} Fighters Owned
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mint New Fighter */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-400" />
            Mint New Fighter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Mint NFT Fighter
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Mint New Fighter</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Element Selection */}
                <div>
                  <label className="text-sm font-medium text-white mb-3 block">
                    Choose Element
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(Element).filter(e => typeof e === 'number').map((element) => (
                      <Button
                        key={element}
                        variant={selectedElement === element ? "default" : "outline"}
                        onClick={() => setSelectedElement(element as Element)}
                        className={cn(
                          'flex items-center gap-2 p-4',
                          selectedElement === element && `bg-gradient-to-r ${getElementColor(element as Element)}`
                        )}
                      >
                        {getElementIcon(element as Element)}
                        {getElementName(element as number)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Level Selection */}
                <div>
                  <label className="text-sm font-medium text-white mb-3 block">
                    Choose Level (Cost: {calculateMintCost(selectedLevel)} LEGEND)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Button
                        key={level}
                        variant={selectedLevel === level ? "default" : "outline"}
                        onClick={() => setSelectedLevel(level)}
                        size="sm"
                      >
                        Lv.{level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Mint Button */}
                <Button
                  onClick={handleMintFighter}
                  disabled={isMinting || tokenBalance < calculateMintCost(selectedLevel)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Mint Fighter ({calculateMintCost(selectedLevel)} LEGEND)
                    </>
                  )}
                </Button>
                
                {tokenBalance < calculateMintCost(selectedLevel) && (
                  <p className="text-sm text-red-400 text-center">
                    Insufficient LEGEND tokens
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Fighter Collection */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Your Fighters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              <span className="ml-2 text-gray-400">Loading fighters...</span>
            </div>
          ) : nftFighters.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No Fighters Yet</h3>
              <p className="text-gray-500 mb-4">Mint your first NFT fighter to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {nftFighters.map((nft, index) => (
                  <motion.div
                    key={nft.tokenId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-600 overflow-hidden">
                      <CardContent className="p-4">
                        <FighterCard
                          fighter={nft}
                          size="sm"
                          showXP={false}
                        />
                        
                        {/* NFT Info */}
                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <div className="flex items-center justify-between text-xs">
                            <Badge variant="outline" className="text-xs">
                              Token #{nft.tokenId}
                            </Badge>
                            <div className="flex items-center gap-1 text-purple-400">
                              <Sparkles className="h-3 w-3" />
                              <span>NFT</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

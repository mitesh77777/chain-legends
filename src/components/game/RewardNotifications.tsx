'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Coins, 
  X, 
  ExternalLink,
  Star,
  Zap
} from 'lucide-react'
import { formatTokenAmount } from '@/lib/contracts'

export interface RewardNotification {
  id: string
  type: 'battle_win' | 'token_earned' | 'fighter_minted' | 'level_up'
  title: string
  message: string
  amount?: number
  txHash?: string
  timestamp: number
}

interface RewardNotificationProps {
  notifications: RewardNotification[]
  onDismiss: (id: string) => void
  onViewTransaction?: (txHash: string) => void
}

export function RewardNotificationCenter({ 
  notifications, 
  onDismiss, 
  onViewTransaction 
}: RewardNotificationProps) {
  const getNotificationIcon = (type: RewardNotification['type']) => {
    switch (type) {
      case 'battle_win':
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case 'token_earned':
        return <Coins className="w-5 h-5 text-green-400" />
      case 'fighter_minted':
        return <Star className="w-5 h-5 text-purple-400" />
      case 'level_up':
        return <Zap className="w-5 h-5 text-blue-400" />
      default:
        return <Trophy className="w-5 h-5 text-gray-400" />
    }
  }

  const getNotificationColor = (type: RewardNotification['type']) => {
    switch (type) {
      case 'battle_win':
        return 'from-yellow-900/50 to-orange-900/50 border-yellow-500/30'
      case 'token_earned':
        return 'from-green-900/50 to-emerald-900/50 border-green-500/30'
      case 'fighter_minted':
        return 'from-purple-900/50 to-blue-900/50 border-purple-500/30'
      case 'level_up':
        return 'from-blue-900/50 to-cyan-900/50 border-blue-500/30'
      default:
        return 'from-gray-900/50 to-gray-800/50 border-gray-500/30'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
          >
            <Card className={`bg-gradient-to-br ${getNotificationColor(notification.type)} border backdrop-blur-sm`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {notification.amount && (
                          <Badge className="bg-green-600 text-xs">
                            +{formatTokenAmount(notification.amount)} LEGEND
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-300 text-xs mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.txHash && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs border-gray-600 hover:border-gray-500"
                          onClick={() => onViewTransaction?.(notification.txHash!)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View TX
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => onDismiss(notification.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for managing notifications
export function useRewardNotifications() {
  const [notifications, setNotifications] = useState<RewardNotification[]>([])

  const addNotification = (notification: Omit<RewardNotification, 'id' | 'timestamp'>) => {
    const newNotification: RewardNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id)
    }, 5000)
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll
  }
}

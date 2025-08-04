'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface StreamChatProps {
  messages: ChatMessage[]
  onSendMessage?: (message: string) => void
}

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: number
  type: 'spectator' | 'reaction' | 'system'
}

const mockSpectators = [
  'CryptoKnight87', 'BattleMaster99', 'ElementalFan', 'ChainWarrior',
  'NFTCollector', 'GameFi_Pro', 'LegendHunter', 'ArenaChamp',
  'Web3Fighter', 'MetaGamer42'
]

const reactionMessages = [
  '🔥 FIRE ATTACK!', '💧 Nice water move!', '🌱 Earth power!', '💨 Air strike!',
  '⚔️ BRUTAL!', '🛡️ Good defense!', '💥 CRITICAL HIT!', '😱 OH NO!',
  '👏 AMAZING!', '🤯 INSANE!', '💪 STRONG!', '⚡ POWERFUL!',
  '🎯 PERFECT!', '🔥 ON FIRE!', '❄️ COLD BLOODED!', '💀 DEVASTATING!'
]

const encouragementMessages = [
  'You got this!', 'Don\'t give up!', 'COMEBACK TIME!', 'Stay strong!',
  'Turn it around!', 'Fight back!', 'You can win!', 'Keep going!'
]

export function StreamChat({ messages, onSendMessage }: StreamChatProps) {
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages || [])
  const [isActive, setIsActive] = useState(true)

  // Generate realistic chat activity
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      // Random chance to add a spectator message
      if (Math.random() < 0.3) {
        const randomUser = mockSpectators[Math.floor(Math.random() * mockSpectators.length)]
        const randomMessage = reactionMessages[Math.floor(Math.random() * reactionMessages.length)]
        
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          user: randomUser,
          message: randomMessage,
          timestamp: Date.now(),
          type: 'reaction'
        }

        setLocalMessages(prev => [...prev.slice(-20), newMessage]) // Keep last 20 messages
      }
    }, 2000 + Math.random() * 3000) // Random interval between 2-5 seconds

    return () => clearInterval(interval)
  }, [isActive])

  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      user: 'System',
      message,
      timestamp: Date.now(),
      type: 'system'
    }
    setLocalMessages(prev => [...prev.slice(-20), systemMessage])
  }

  const addReactionMessage = (action: string) => {
    const reactions = {
      'attack': ['🔥 Nice attack!', '⚔️ Good hit!', '💥 BOOM!'],
      'critical': ['🤯 CRITICAL!', '💥 INSANE!', '🔥 ON FIRE!'],
      'defend': ['🛡️ Smart defense!', '💪 Good block!', '👍 Nice save!'],
      'special': ['⚡ SPECIAL MOVE!', '🌟 AMAZING!', '🔥 LEGENDARY!'],
      'heal': ['💚 Good heal!', '❤️ Stay alive!', '✨ Smart move!']
    }

    const actionReactions = reactions[action as keyof typeof reactions] || reactions.attack
    const randomReaction = actionReactions[Math.floor(Math.random() * actionReactions.length)]
    const randomUser = mockSpectators[Math.floor(Math.random() * mockSpectators.length)]
    
    const reactionMsg: ChatMessage = {
      id: `reaction_${Date.now()}`,
      user: randomUser,
      message: randomReaction,
      timestamp: Date.now(),
      type: 'reaction'
    }
    
    setLocalMessages(prev => [...prev.slice(-20), reactionMsg])
  }

  // Expose methods for battle events
  useEffect(() => {
    (window as any).battleChatReact = addReactionMessage;
    (window as any).battleChatSystem = addSystemMessage;
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 p-4 h-64 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Live Chat ({Math.floor(Math.random() * 50) + 120})
        </h3>
        <button
          onClick={() => setIsActive(!isActive)}
          className="text-xs text-gray-400 hover:text-white"
        >
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-600">
        {localMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs ${
              msg.type === 'system' 
                ? 'text-yellow-400 font-semibold' 
                : 'text-gray-300'
            }`}
          >
            <span className={`font-semibold ${
              msg.type === 'system' 
                ? 'text-yellow-400' 
                : msg.type === 'reaction'
                ? 'text-blue-400'
                : 'text-purple-400'
            }`}>
              {msg.user}:
            </span>
            <span className="ml-1">{msg.message}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center">
        💬 Spectators are watching live!
      </div>
    </motion.div>
  )
}

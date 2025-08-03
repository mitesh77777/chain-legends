'use client'

import React from 'react'
import { Wallet, LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatAddress } from '@/lib/utils'
import { useWallet } from './WalletProvider'

interface WalletConnectProps {
  onConnect?: (address: string) => void
  className?: string
}

export function WalletConnect({ onConnect, className }: WalletConnectProps) {
  const { isConnected, address, isLoading, connect, disconnect } = useWallet()

  const handleConnect = async () => {
    try {
      await connect()
      if (address && onConnect) {
        onConnect(address)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  if (isLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {formatAddress(address)}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={handleConnect}
      variant="game"
      className={`font-semibold ${className}`}
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
}

export function WalletStatus() {
  const { isConnected, address, isLoading } = useWallet()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Checking wallet...</span>
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-mono">{formatAddress(address)}</span>
        <Badge variant="success" size="sm">Connected</Badge>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-red-500 rounded-full" />
      <span className="text-sm text-muted-foreground">Not connected</span>
    </div>
  )
}
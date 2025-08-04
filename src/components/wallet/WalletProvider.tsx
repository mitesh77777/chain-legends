'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getSequenceWallet } from '@/lib/sequence'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  isLoading: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  switchNetwork: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      setIsLoading(true)
      const wallet = getSequenceWallet()
      if (!wallet) {
        setIsLoading(false)
        return
      }
      
      const isConnected = await wallet.isConnected()
      if (isConnected) {
        const signer = wallet.getSigner()
        const address = await signer.getAddress()
        setIsConnected(true)
        setAddress(address)
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connect = async () => {
    try {
      setIsLoading(true)
      const wallet = getSequenceWallet()
      if (!wallet) {
        throw new Error('Wallet not available')
      }
      
      const connectDetails = await wallet.connect({
        app: 'Chain Legends',
        askForEmail: false,
      })
      
      if (connectDetails && connectDetails.connected) {
        const signer = wallet.getSigner()
        const address = await signer.getAddress()
        setIsConnected(true)
        setAddress(address)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      const wallet = getSequenceWallet()
      if (wallet) {
        await wallet.disconnect()
      }
      setIsConnected(false)
      setAddress(null)
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      throw error
    }
  }

  const switchNetwork = async () => {
    // Sequence handles network switching automatically
    console.log('Network switching handled by Sequence')
  }

  const value: WalletContextType = {
    isConnected,
    address,
    isLoading,
    connect,
    disconnect,
    switchNetwork,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
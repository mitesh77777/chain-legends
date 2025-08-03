'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
      const isConnected = await sequenceWallet.isConnected()
      if (isConnected) {
        const signer = sequenceWallet.getSigner()
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
      const connectDetails = await sequenceWallet.connect({
        app: 'Chain Legends',
        askForEmail: false,
      })
      
      if (connectDetails && connectDetails.connected) {
        const signer = sequenceWallet.getSigner()
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
      await sequenceWallet.disconnect()
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
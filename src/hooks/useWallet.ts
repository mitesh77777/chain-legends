'use client'

import { useState, useEffect, useCallback } from 'react'
import { sequenceWallet } from '@/lib/sequence'

export interface WalletState {
  isConnected: boolean
  address: string | null
  isLoading: boolean
  error: string | null
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isLoading: true,
    error: null,
  })

  const checkConnection = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const wallet = sequenceWallet.getWallet()
      
      if (wallet && await wallet.isConnected()) {
        const signer = wallet.getSigner()
        const address = await signer.getAddress()
        setState({
          isConnected: true,
          address,
          isLoading: false,
          error: null,
        })
      } else {
        setState({
          isConnected: false,
          address: null,
          isLoading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
      setState({
        isConnected: false,
        address: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [])

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const wallet = sequenceWallet.getWallet()
      const connectDetails = await wallet.connect({
        app: 'Chain Legends',
        askForEmail: false,
      })
      
      if (connectDetails && connectDetails.connected) {
        const signer = wallet.getSigner()
        const address = await signer.getAddress()
        setState({
          isConnected: true,
          address,
          isLoading: false,
          error: null,
        })
        return address
      } else {
        throw new Error('Failed to connect wallet')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      const wallet = sequenceWallet.getWallet()
      await wallet.disconnect()
      setState({
        isConnected: false,
        address: null,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect wallet'
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }))
      throw error
    }
  }, [])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  return {
    ...state,
    connect,
    disconnect,
    refresh: checkConnection,
  }
}
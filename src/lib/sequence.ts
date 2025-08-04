import { sequence } from '0xsequence'

export const PROJECT_ACCESS_KEY = process.env.NEXT_PUBLIC_SEQUENCE_PROJECT_ACCESS_KEY || ''

// Configuration for Etherlink testnet
export const ETHERLINK_TESTNET = {
  chainId: parseInt(process.env.NEXT_PUBLIC_ETHERLINK_CHAIN_ID || '128123'),
  name: 'Etherlink Testnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL || 'https://128123.rpc.thirdweb.com'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL || 'https://128123.rpc.thirdweb.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherlink Explorer',
      url: 'https://testnet.explorer.etherlink.com',
    },
  },
  testnet: true,
}

// Initialize Sequence only on client side
export const getSequenceWallet = () => {
  if (typeof window === 'undefined' || !PROJECT_ACCESS_KEY) {
    return null
  }
  
  try {
    return sequence.initWallet(PROJECT_ACCESS_KEY)
  } catch (error) {
    console.error('Failed to initialize Sequence wallet:', error)
    return null
  }
}

export const getNetwork = () => {
  return ETHERLINK_TESTNET
}

export const getSupportedNetworks = () => {
  return [ETHERLINK_TESTNET]
}
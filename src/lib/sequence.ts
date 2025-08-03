import { sequence } from '0xsequence'

export const PROJECT_ACCESS_KEY = process.env.NEXT_PUBLIC_SEQUENCE_PROJECT_ACCESS_KEY || 'demo_key'

// Initialize Sequence for Etherlink Testnet  
export const sequenceWallet = sequence.initWallet({
  projectAccessKey: PROJECT_ACCESS_KEY,
  defaultNetwork: 'etherlink-testnet',
  rpcUrl: process.env.NEXT_PUBLIC_ETHERLINK_RPC_URL || 'https://node.ghostnet.etherlink.com'
})

// Configure for Etherlink testnet
export const ETHERLINK_TESTNET = {
  chainId: 128123,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://node.ghostnet.etherlink.com'],
    },
    public: {
      http: ['https://node.ghostnet.etherlink.com'],
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

export const getNetwork = () => {
  return ETHERLINK_TESTNET
}

export const getSupportedNetworks = () => {
  return [ETHERLINK_TESTNET]
}
import { createThirdwebClient, defineChain } from 'thirdweb'
import { ThirdwebProvider } from 'thirdweb/react'

export const THIRDWEB_CLIENT_ID = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!

if (!THIRDWEB_CLIENT_ID) {
  throw new Error('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required')
}

export const client = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
})

// Etherlink testnet configuration
export const etherlinkTestnet = defineChain({
  id: 128123,
  name: 'Etherlink Testnet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ', 
    decimals: 18,
  },
  rpc: 'https://node.ghostnet.etherlink.com',
  blockExplorers: [
    {
      name: 'Etherlink Explorer',
      url: 'https://testnet.explorer.etherlink.com',
    },
  ],
  testnet: true,
})

// Contract addresses (to be deployed)
export const CONTRACT_ADDRESSES = {
  CHAIN_FIGHTER: process.env.NEXT_PUBLIC_CHAIN_FIGHTER_ADDRESS || '',
  BATTLE_WEAPON: process.env.NEXT_PUBLIC_BATTLE_WEAPON_ADDRESS || '',
  BATTLE_ARMOR: process.env.NEXT_PUBLIC_BATTLE_ARMOR_ADDRESS || '',
  BATTLE_MANAGER: process.env.NEXT_PUBLIC_BATTLE_MANAGER_ADDRESS || '',
  TOURNAMENT_MANAGER: process.env.NEXT_PUBLIC_TOURNAMENT_MANAGER_ADDRESS || '',
}

export const supportedChains = [etherlinkTestnet]

export { ThirdwebProvider }
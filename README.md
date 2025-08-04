# Chain Legends - Web3 Battle Arena

A complete browser-based blockchain battle arena game built with Next.js 14, Sequence Wallet, Thirdweb, and Supabase.

## 🙏 Sponsor Integration

This project was made possible by our amazing sponsors who provided essential Web3 infrastructure:

### 🔗 Sequence Integration
**Sponsor**: [Sequence](https://sequence.xyz)

Sequence powers our wallet infrastructure and provides seamless Web3 onboarding:

- **Wallet-as-a-Service**: Users can create wallets with just an email/social login
- **Gasless Transactions**: Sponsored transactions for a smooth gaming experience
- **Multi-chain Support**: Built-in support for multiple blockchains
- **Smart Contract Wallets**: Enhanced security with programmable wallets
- **Developer Tools**: Comprehensive SDK for wallet integration

**Implementation**:
```typescript
// Wallet provider setup with Sequence
import { SequenceWaaS } from '@0xsequence/waas'

const sequenceWaas = new SequenceWaaS({
  projectAccessKey: process.env.NEXT_PUBLIC_SEQUENCE_PROJECT_ACCESS_KEY,
  waasConfigKey: process.env.NEXT_PUBLIC_SEQUENCE_WAAS_CONFIG_KEY,
})
```

### ⚡ Thirdweb Integration
**Sponsor**: [Thirdweb](https://thirdweb.com)

Thirdweb provides our smart contract infrastructure and blockchain development tools:

- **Smart Contract SDK**: Pre-built, audited contracts for NFTs and tokens
- **RPC Infrastructure**: Reliable blockchain connectivity via Thirdweb RPC
- **Contract Dashboard**: Easy deployment and management of smart contracts
- **Token Contracts**: ERC-20 LEGEND tokens for in-game currency
- **NFT Contracts**: ERC-721 fighters with metadata and evolution mechanics

**Implementation**:
```typescript
// Thirdweb client setup
import { createThirdwebClient, getContract } from "thirdweb"

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
})

// Game token contract
export const gameTokenContract = getContract({
  client,
  chain: etherlinkTestnet,
  address: "0x..." // Deployed via Thirdweb Dashboard
})
```

### 🌐 Etherlink Testnet
**Blockchain**: Etherlink Testnet (Tezos Layer 2)

- **Fast Transactions**: Sub-second confirmation times
- **Low Fees**: Minimal gas costs for gaming transactions  
- **EVM Compatible**: Full Ethereum tooling support
- **Scalable**: High throughput for real-time gaming

## 🎮 Game Features

- **Turn-based Combat**: Strategic battles with 4 actions (Attack, Defend, Special, Item)
- **Elemental System**: Fire, Water, Earth, Air with type advantages
- **NFT Fighters**: Collect, level up, and evolve your fighters
- **Real-time Battles**: 10-second turns with live opponents
- **Tournament Mode**: Compete in brackets for prizes
- **Social Features**: Share battles, leaderboards, achievements

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Sequence developer account
- Thirdweb account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chain-legends
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables:
   - Supabase project URL and anon key
   - Sequence project access key
   - Thirdweb client ID

4. **Database Setup**
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Enable real-time on the `battle_rooms` table

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI
- **Web3 Infrastructure**: 
  - **Sequence**: Wallet-as-a-Service, gasless transactions
  - **Thirdweb**: Smart contracts, RPC infrastructure, token/NFT management
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Blockchain**: Etherlink Testnet (Tezos Layer 2)

## 💼 Sponsor-Powered Features

### Sequence-Powered Features
- **One-Click Onboarding**: Users can start playing with just email/social login
- **Gasless Gaming**: All in-game transactions are sponsored for seamless UX
- **Cross-Platform Wallets**: Works on mobile and desktop with same account
- **Social Recovery**: Never lose access to your fighters and progress

### Thirdweb-Powered Features  
- **Smart Contract Dashboard**: Easy deployment and upgrades via Thirdweb console
- **Token Economy**: LEGEND ERC-20 tokens with built-in reward mechanisms
- **NFT Fighters**: ERC-721 contracts with evolution and breeding mechanics
- **RPC Reliability**: 99.9% uptime via Thirdweb's infrastructure

## 🎯 Game Architecture

### Battle System
- Turn-based combat with 10-second action limits
- Rock-paper-scissors mechanics with elemental advantages
- Experience and leveling system
- Equipment system with durability

### NFT System
- ERC-721 fighters with on-chain metadata
- Equipment NFTs (weapons, armor)
- Evolution system based on level milestones
- Marketplace integration

### Matchmaking
- Real-time opponent finding
- Skill-based matching using ELO rating
- Tournament bracket management
- Battle history tracking

## 📁 Project Structure

```
chain-legends/
├── src/
│   ├── app/                    # Next.js app directory
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── wallet/             # Wallet connection components
│   │   ├── game/               # Game-specific components
│   │   ├── nft/                # NFT-related components
│   │   └── social/             # Social features
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── stores/                 # State management
│   └── types/                  # TypeScript type definitions
├── contracts/                  # Smart contracts
├── supabase/                   # Database migrations
└── public/                     # Static assets
```

## 🎲 How to Play

1. **Connect Wallet**: Connect your Sequence wallet
2. **Summon Fighter**: Get your first NFT fighter
3. **Enter Battle**: Find an opponent or join a tournament
4. **Choose Actions**: Select Attack, Defend, Special, or Heal
5. **Win & Evolve**: Gain XP, level up, and evolve your fighter

## 🏆 Battle Actions

- **Attack**: Deal damage based on your attack vs opponent's defense
- **Defend**: Reduce incoming damage by 50%
- **Special**: Powerful elemental attack with type bonuses
- **Item**: Heal 25% of max health (limited uses)

## 🌟 Elemental Advantages

- 🔥 **Fire** beats 🌍 Earth
- 🌊 **Water** beats 🔥 Fire  
- 🌍 **Earth** beats 💨 Air
- 💨 **Air** beats 🌊 Water

## 🚀 Deployment

### Environment Variables

Set up the following in your production environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
NEXT_PUBLIC_SEQUENCE_PROJECT_ACCESS_KEY=your_sequence_key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
# ... other variables from .env.example
```

### Smart Contract Deployment

1. Deploy contracts using Thirdweb CLI:
   ```bash
   npx thirdweb deploy
   ```

2. Update contract addresses in environment variables

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Database query optimization with indexes
- Real-time subscription management
- Caching strategies for game data

## 🔐 Security Features

- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- Rate limiting for API calls
- Secure wallet integration
- Anti-cheat measures

## 🛣 Roadmap

- [ ] Smart contract deployment
- [ ] Tournament system
- [ ] Equipment crafting
- [ ] Guild/Team battles
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] NFT marketplace
- [ ] Cross-chain support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
---

Built with ❤️ for the Web3 gaming community

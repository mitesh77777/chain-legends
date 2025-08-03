# Chain Legends - Web3 Battle Arena

A complete browser-based blockchain battle arena game built with Next.js 14, Sequence Wallet, Thirdweb, and Supabase.

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
- **Web3**: Sequence Wallet, Thirdweb SDK
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Blockchain**: Etherlink Testnet

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

## 🆘 Support

- Join our Discord: [discord-link]
- Follow on Twitter: [@ChainLegends]
- Documentation: [docs-link]

---

Built with ❤️ for the Web3 gaming community
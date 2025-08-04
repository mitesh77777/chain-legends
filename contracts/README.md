# Chain Legends Smart Contracts

Complete smart contract suite for the Chain Legends Web3 battle game on Etherlink testnet.

## 🏗️ **Contract Architecture**

### **1. ChainLegendsFighter.sol** - NFT Fighter Contract
- **ERC721** implementation for fighter NFTs
- **Dynamic stats** (health, attack, defense, speed)
- **Elemental system** (Fire, Water, Earth, Air)
- **Level progression** and experience system
- **Battle result tracking** (wins/losses)

### **2. LegendToken.sol** - Game Token Contract
- **ERC20** implementation for LEGEND tokens
- **Reward minting** for battles and achievements
- **Supply management** with max cap
- **Authorized minter** system for game contracts

### **3. BattleArena.sol** - Battle Management Contract
- **Battle creation** and management
- **Entry fee** handling with token stakes
- **Result verification** with battle data hashing
- **Reward distribution** to winners and losers
- **Anti-cheat** measures with unique battle hashes

### **4. Tournament.sol** - Tournament System Contract
- **Tournament creation** with different formats
- **Registration system** with entry fees
- **Match generation** and result tracking
- **Prize pool** management and distribution
- **Ranking system** for participants

### **5. ChainLegendsDeployer.sol** - Deployment Contract
- **Atomic deployment** of all contracts
- **Permission setup** between contracts
- **Ownership transfer** to deployer
- **Configuration management**

## 🚀 **Quick Start**

### **Prerequisites**
```bash
node --version  # v16+ required
npm --version   # v7+ required
```

### **Installation**
```bash
cd contracts
npm install
```

### **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your private key and configuration
```

### **Compilation**
```bash
npm run compile
```

### **Testing**
```bash
npm run test
```

### **Local Deployment**
```bash
# Start local Hardhat node
npm run node

# Deploy to local network (new terminal)
npm run deploy:localhost
```

### **Etherlink Testnet Deployment**
```bash
# Make sure .env has your private key
npm run deploy:etherlink
```

## 📋 **Contract Addresses (After Deployment)**

After successful deployment, update these addresses in your frontend:

```typescript
// /lib/contracts.ts
export const CONTRACT_ADDRESSES = {
  FIGHTER_NFT: '0x...', // ChainLegendsFighter
  BATTLE_ARENA: '0x...', // BattleArena  
  GAME_TOKEN: '0x...', // LegendToken
  TOURNAMENT: '0x...', // Tournament
} as const
```

## 🎮 **Game Mechanics**

### **Fighter NFTs**
- **Mint Cost**: 0.01 ETH × level (Level 1 = 0.01 ETH, Level 5 = 0.05 ETH)
- **Elements**: Fire (+attack, +speed), Water (+health, +defense), Earth (+defense, +health), Air (+speed, +attack)
- **Stats**: Health, Attack, Defense, Speed (scale with level)
- **Experience**: Gained from battles, enables level progression

### **LEGEND Tokens**
- **Battle Win**: 100 LEGEND + entry fee pot
- **Battle Loss**: 25 LEGEND (participation reward)
- **Daily Login**: 50 LEGEND
- **Tournament Win**: 500+ LEGEND (based on prize pool)

### **Battle System**
- **Entry Fees**: 10-1000 LEGEND tokens
- **Battle Verification**: Results hashed and stored on-chain
- **Timeout Protection**: Battles auto-cancel after 1 hour
- **Anti-Cheat**: Unique battle hashes prevent replay attacks

### **Tournaments**
- **Entry Fees**: Minimum 50 LEGEND
- **Participants**: 4-64 fighters (must be even)
- **Prize Distribution**: 70% winner, 20% runner-up, 10% third place
- **Organizer Fee**: 5% of prize pool

## 🔧 **Integration Guide**

### **1. Frontend Integration**
```typescript
// Import contracts
import { getFighterNFTContract, getBattleArenaContract } from '@/lib/contracts'

// Mint fighter
const result = await ChainLegends.mintFighter(Element.FIRE, 2)

// Create battle
const battleId = await ChainLegends.createBattle(fighter1Id, fighter2Id)

// Submit result
await ChainLegends.submitBattleResult(battleId, winnerId, loserId, battleData)
```

### **2. Event Listening**
```typescript
// Listen for battle events
const battleContract = getBattleArenaContract()
battleContract.on('BattleCreated', (battleId, player1, player2) => {
  console.log('New battle created:', battleId)
})
```

### **3. Token Management**
```typescript
// Check balance
const balance = await ChainLegends.getTokenBalance(address)

// Approve spending
await tokenContract.approve(battleArenaAddress, amount)
```

## 🧪 **Testing**

### **Run Full Test Suite**
```bash
npm run test
```

### **Test Coverage**
- ✅ Fighter minting and stats
- ✅ Token rewards and transfers  
- ✅ Battle creation and completion
- ✅ Tournament registration and prizes
- ✅ Permission and authorization systems
- ✅ Full integration workflow

### **Gas Usage Estimation**
- **Mint Fighter**: ~200,000 gas
- **Create Battle**: ~150,000 gas
- **Submit Result**: ~100,000 gas
- **Claim Rewards**: ~80,000 gas

## 🔒 **Security Features**

### **Access Control**
- **Ownable** contracts with secure ownership transfer
- **Authorized contracts** for cross-contract interactions
- **ReentrancyGuard** on all payable functions

### **Anti-Cheat Measures**
- **Battle hash verification** prevents result manipulation
- **Timeout systems** prevent indefinite pending states
- **Unique hash tracking** prevents replay attacks

### **Economic Security**
- **Supply caps** prevent token inflation
- **Entry fee limits** prevent excessive staking
- **Emergency functions** for dispute resolution

## 📊 **Contract Statistics**

| Contract | Size | Gas Limit | Functions |
|----------|------|-----------|-----------|
| Fighter NFT | ~3.2kb | 5M | 25+ |
| LEGEND Token | ~1.8kb | 3M | 15+ |
| Battle Arena | ~2.9kb | 4M | 20+ |
| Tournament | ~3.5kb | 6M | 25+ |

## 🚨 **Important Notes**

1. **Private Keys**: Never commit private keys to version control
2. **Testnet Only**: These contracts are for Etherlink testnet
3. **Gas Fees**: Ensure sufficient ETH for deployment (~0.1 ETH)
4. **Verification**: Contracts auto-verify on Etherlink explorer
5. **Upgrades**: Contracts are not upgradeable by design for security

## 📞 **Support**

- **Documentation**: Check contract comments for detailed function docs
- **Testing**: Run `npm run test` before any changes
- **Issues**: Create GitHub issues for bugs or feature requests
- **Deployment**: Use deployment script for consistent setup

## 🎯 **Next Steps After Deployment**

1. ✅ Update frontend contract addresses
2. ✅ Test fighter minting on testnet
3. ✅ Create first blockchain battle
4. ✅ Set up tournament system
5. ✅ Implement reward claiming UI
6. ✅ Add leaderboard integration

**Ready to battle on the blockchain!** ⚔️🔗

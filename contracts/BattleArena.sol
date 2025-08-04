// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ChainLegendsFighter.sol";
import "./LegendToken.sol";

contract BattleArena is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _battleIdCounter;

    ChainLegendsFighter public fighterContract;
    LegendToken public legendToken;

    // Battle states
    enum BattleStatus { CREATED, ACTIVE, COMPLETED, CANCELLED }

    // Battle struct
    struct Battle {
        uint256 id;
        address player1;
        address player2;
        uint256 fighter1Id;
        uint256 fighter2Id;
        uint256 winnerId;
        uint256 loserId;
        BattleStatus status;
        bytes32 battleDataHash;
        uint256 createdAt;
        uint256 completedAt;
        uint256 entryFee;
        bool rewardsClaimed;
    }

    // Mappings
    mapping(uint256 => Battle) public battles;
    mapping(address => uint256[]) public userBattles;
    mapping(address => uint256) public userWins;
    mapping(address => uint256) public userLosses;
    mapping(bytes32 => bool) public usedBattleHashes;

    // Events
    event BattleCreated(uint256 indexed battleId, address indexed player1, address indexed player2, uint256 fighter1Id, uint256 fighter2Id);
    event BattleCompleted(uint256 indexed battleId, uint256 indexed winnerId, uint256 indexed loserId);
    event RewardsClaimed(uint256 indexed battleId, address indexed winner, uint256 winnerReward, address indexed loser, uint256 loserReward);
    event BattleCancelled(uint256 indexed battleId, string reason);

    // Constants
    uint256 public constant MIN_ENTRY_FEE = 10 * 10**18; // 10 LEGEND tokens
    uint256 public constant MAX_ENTRY_FEE = 1000 * 10**18; // 1000 LEGEND tokens
    uint256 public constant BATTLE_TIMEOUT = 1 hours;

    constructor(address _fighterContract, address _legendToken) Ownable(msg.sender) {
        fighterContract = ChainLegendsFighter(_fighterContract);
        legendToken = LegendToken(_legendToken);
    }

    /**
     * @dev Create a new battle
     */
    function createBattle(
        uint256 fighter1Id,
        uint256 fighter2Id,
        uint256 entryFee
    ) external nonReentrant returns (uint256) {
        require(fighterContract.ownerOf(fighter1Id) == msg.sender, "Not owner of fighter1");
        require(entryFee >= MIN_ENTRY_FEE && entryFee <= MAX_ENTRY_FEE, "Invalid entry fee");

        // Get fighter2 owner
        address player2 = fighterContract.ownerOf(fighter2Id);
        require(player2 != msg.sender, "Cannot battle own fighter");

        // Check if fighters are active and healthy
        (ChainLegendsFighter.FighterStats memory stats1, ) = fighterContract.getFighterInfo(fighter1Id);
        (ChainLegendsFighter.FighterStats memory stats2, ) = fighterContract.getFighterInfo(fighter2Id);

        require(stats1.isActive && stats2.isActive, "Fighter not active");
        require(stats1.health > 0 && stats2.health > 0, "Fighter has no health");

        // Transfer entry fee from both players
        if (entryFee > 0) {
            require(legendToken.transferFrom(msg.sender, address(this), entryFee), "Entry fee transfer failed for player1");
            require(legendToken.transferFrom(player2, address(this), entryFee), "Entry fee transfer failed for player2");
        }

        uint256 battleId = _battleIdCounter.current();
        _battleIdCounter.increment();

        battles[battleId] = Battle({
            id: battleId,
            player1: msg.sender,
            player2: player2,
            fighter1Id: fighter1Id,
            fighter2Id: fighter2Id,
            winnerId: 0,
            loserId: 0,
            status: BattleStatus.CREATED,
            battleDataHash: bytes32(0),
            createdAt: block.timestamp,
            completedAt: 0,
            entryFee: entryFee,
            rewardsClaimed: false
        });

        userBattles[msg.sender].push(battleId);
        userBattles[player2].push(battleId);

        emit BattleCreated(battleId, msg.sender, player2, fighter1Id, fighter2Id);
        return battleId;
    }

    /**
     * @dev Submit battle result with verification
     */
    function submitBattleResult(
        uint256 battleId,
        uint256 winnerId,
        uint256 loserId,
        bytes32 battleDataHash
    ) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.status == BattleStatus.CREATED, "Battle not in created state");
        require(block.timestamp <= battle.createdAt + BATTLE_TIMEOUT, "Battle timed out");
        require(!usedBattleHashes[battleDataHash], "Battle data already used");

        // Verify caller is one of the players
        require(msg.sender == battle.player1 || msg.sender == battle.player2, "Not a battle participant");

        // Verify winner/loser are the battle fighters
        require(
            (winnerId == battle.fighter1Id && loserId == battle.fighter2Id) ||
            (winnerId == battle.fighter2Id && loserId == battle.fighter1Id),
            "Invalid winner/loser fighters"
        );

        battle.winnerId = winnerId;
        battle.loserId = loserId;
        battle.status = BattleStatus.COMPLETED;
        battle.battleDataHash = battleDataHash;
        battle.completedAt = block.timestamp;

        usedBattleHashes[battleDataHash] = true;

        // Update user win/loss records
        address winner = fighterContract.ownerOf(winnerId);
        address loser = fighterContract.ownerOf(loserId);

        userWins[winner]++;
        userLosses[loser]++;

        // Update fighter stats
        fighterContract.addBattleResult(winnerId, loserId);

        emit BattleCompleted(battleId, winnerId, loserId);
    }

    /**
     * @dev Claim battle rewards
     */
    function claimBattleRewards(uint256 battleId) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.status == BattleStatus.COMPLETED, "Battle not completed");
        require(!battle.rewardsClaimed, "Rewards already claimed");

        address winner = fighterContract.ownerOf(battle.winnerId);
        address loser = fighterContract.ownerOf(battle.loserId);

        // Only winner or loser can claim
        require(msg.sender == winner || msg.sender == loser, "Not eligible for rewards");

        battle.rewardsClaimed = true;

        // Calculate rewards
        uint256 winnerReward = legendToken.BATTLE_WIN_REWARD() + (battle.entryFee * 2); // Base + pot
        uint256 loserReward = legendToken.BATTLE_LOSS_REWARD();

        // Mint base rewards
        legendToken.mintBattleReward(winner, loser);

        // Transfer entry fee pot to winner
        if (battle.entryFee > 0) {
            require(legendToken.transfer(winner, battle.entryFee * 2), "Pot transfer failed");
        }

        emit RewardsClaimed(battleId, winner, winnerReward, loser, loserReward);
    }

    /**
     * @dev Cancel battle (for timeouts or disputes)
     */
    function cancelBattle(uint256 battleId, string memory reason) external nonReentrant {
        Battle storage battle = battles[battleId];
        require(battle.status == BattleStatus.CREATED, "Battle cannot be cancelled");

        bool canCancel = false;

        // Owner can always cancel
        if (msg.sender == owner()) {
            canCancel = true;
        }
        // Players can cancel if battle timed out
        else if (
            (msg.sender == battle.player1 || msg.sender == battle.player2) &&
            block.timestamp > battle.createdAt + BATTLE_TIMEOUT
        ) {
            canCancel = true;
        }

        require(canCancel, "Not authorized to cancel");

        battle.status = BattleStatus.CANCELLED;

        // Refund entry fees
        if (battle.entryFee > 0) {
            require(legendToken.transfer(battle.player1, battle.entryFee), "Refund failed for player1");
            require(legendToken.transfer(battle.player2, battle.entryFee), "Refund failed for player2");
        }

        emit BattleCancelled(battleId, reason);
    }

    /**
     * @dev Get battle details
     */
    function getBattle(uint256 battleId) external view returns (Battle memory) {
        return battles[battleId];
    }

    /**
     * @dev Get user's battle history
     */
    function getUserBattles(address user) external view returns (uint256[] memory) {
        return userBattles[user];
    }

    /**
     * @dev Get user's win/loss record
     */
    function getUserRecord(address user) external view returns (uint256 wins, uint256 losses) {
        return (userWins[user], userLosses[user]);
    }

    /**
     * @dev Get total battles count
     */
    function getTotalBattles() external view returns (uint256) {
        return _battleIdCounter.current();
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = legendToken.balanceOf(address(this));
        require(legendToken.transfer(owner(), balance), "Emergency withdraw failed");
    }

    /**
     * @dev Update contract addresses (owner only)
     */
    function updateContracts(address _fighterContract, address _legendToken) external onlyOwner {
        fighterContract = ChainLegendsFighter(_fighterContract);
        legendToken = LegendToken(_legendToken);
    }
}
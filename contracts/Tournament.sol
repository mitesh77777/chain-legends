// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ChainLegendsFighter.sol";
import "./LegendToken.sol";

contract Tournament is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tournamentIdCounter;

    ChainLegendsFighter public fighterContract;
    LegendToken public legendToken;

    // Tournament states and types as uint8 to save gas
    uint8 constant TOURNAMENT_STATUS_REGISTRATION = 0;
    uint8 constant TOURNAMENT_STATUS_ACTIVE = 1;
    uint8 constant TOURNAMENT_STATUS_COMPLETED = 2;
    uint8 constant TOURNAMENT_STATUS_CANCELLED = 3;
    
    uint8 constant TOURNAMENT_TYPE_SINGLE_ELIMINATION = 0;
    uint8 constant TOURNAMENT_TYPE_DOUBLE_ELIMINATION = 1;
    uint8 constant TOURNAMENT_TYPE_ROUND_ROBIN = 2;

    // Tournament struct - simplified
    struct TournamentInfo {
        uint256 id;
        string name;
        uint8 tournamentType;
        uint8 status;
        uint256 entryFee;
        uint256 maxParticipants;
        uint256 prizePool;
        uint256 registrationEnd;
        uint256 tournamentEnd;
        address organizer;
        uint256 currentRound;
        bool prizesDistributed;
    }

    // Tournament participant - simplified
    struct Participant {
        address owner;
        uint256 fighterId;
        uint256 wins;
        uint256 losses;
        bool eliminated;
        uint256 finalRank;
    }

    // Tournament match - simplified
    struct Match {
        uint256 round;
        uint256 matchNumber;
        uint256 fighter1Id;
        uint256 fighter2Id;
        uint256 winnerId;
        bool completed;
    }

    // Mappings - simplified
    mapping(uint256 => TournamentInfo) public tournaments;
    mapping(uint256 => mapping(uint256 => Participant)) public tournamentParticipants; // tournamentId => fighterId => Participant
    mapping(uint256 => uint256[]) public tournamentParticipantIds; // tournamentId => participant IDs
    mapping(uint256 => Match[]) public tournamentMatches;
    mapping(uint256 => mapping(uint256 => bool)) private fighterRegistered; // tournamentId => fighterId => isRegistered
    mapping(uint256 => uint256) public activeTournamentMatches; // tournamentId => number of active matches
    mapping(address => uint256[]) public userTournaments;
    
    // Winner tracking
    mapping(uint256 => uint256) public tournamentWinners; // tournamentId => winnerId
    mapping(uint256 => uint256) public tournamentRunnerUps; // tournamentId => runnerUpId
    mapping(uint256 => uint256) public tournamentThirdPlaces; // tournamentId => thirdPlaceId

    // Events
    event TournamentCreated(uint256 indexed tournamentId, string name, uint256 entryFee, uint256 maxParticipants);
    event ParticipantRegistered(uint256 indexed tournamentId, address indexed participant, uint256 fighterId);
    event TournamentStarted(uint256 indexed tournamentId);
    event MatchCreated(uint256 indexed tournamentId, uint256 round, uint256 matchNumber, uint256 fighter1Id, uint256 fighter2Id);
    event MatchCompleted(uint256 indexed tournamentId, uint256 round, uint256 matchNumber, uint256 winnerId);
    event RoundCompleted(uint256 indexed tournamentId, uint256 round);
    event TournamentCompleted(uint256 indexed tournamentId, uint256 winnerId);
    event PrizesDistributed(uint256 indexed tournamentId, uint256 totalPrizes);
    event TournamentCancelled(uint256 indexed tournamentId, string reason);

    // Constants
    uint256 public constant MIN_PARTICIPANTS = 4;
    uint256 public constant MAX_PARTICIPANTS = 64;
    uint256 public constant MIN_ENTRY_FEE = 50 * 10**18; // 50 LEGEND
    uint256 public constant ORGANIZER_FEE_PERCENT = 5; // 5% fee for organizer
    uint256 public constant WINNER_PRIZE_PERCENT = 70; // 70% to winner
    uint256 public constant RUNNER_UP_PRIZE_PERCENT = 20; // 20% to runner-up
    uint256 public constant THIRD_PLACE_PRIZE_PERCENT = 10; // 10% to third place

    constructor(address _fighterContract, address _legendToken) Ownable(msg.sender) {
        fighterContract = ChainLegendsFighter(_fighterContract);
        legendToken = LegendToken(_legendToken);
    }

    // Create tournament - simplified
    function createTournament(
        string memory name,
        uint8 tournamentType,
        uint256 entryFee,
        uint256 maxParticipants,
        uint256 registrationDuration,
        uint256 tournamentDuration
    ) external nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "Tournament name required");
        require(entryFee >= MIN_ENTRY_FEE, "Entry fee too low");
        require(maxParticipants >= MIN_PARTICIPANTS && maxParticipants <= MAX_PARTICIPANTS, "Invalid participant count");
        
        uint256 tournamentId = _tournamentIdCounter.current();
        _tournamentIdCounter.increment();

        tournaments[tournamentId] = TournamentInfo({
            id: tournamentId,
            name: name,
            tournamentType: tournamentType,
            status: TOURNAMENT_STATUS_REGISTRATION,
            entryFee: entryFee,
            maxParticipants: maxParticipants,
            prizePool: 0,
            registrationEnd: block.timestamp + registrationDuration,
            tournamentEnd: block.timestamp + registrationDuration + tournamentDuration,
            organizer: msg.sender,
            currentRound: 0,
            prizesDistributed: false
        });

        userTournaments[msg.sender].push(tournamentId);
        emit TournamentCreated(tournamentId, name, entryFee, maxParticipants);
        return tournamentId;
    }

    // Register for tournament - simplified
    function registerForTournament(uint256 tournamentId, uint256 fighterId) external nonReentrant {
        TournamentInfo storage tournament = tournaments[tournamentId];
        require(tournament.status == TOURNAMENT_STATUS_REGISTRATION, "Registration not open");
        require(block.timestamp <= tournament.registrationEnd, "Registration ended");
        require(tournamentParticipantIds[tournamentId].length < tournament.maxParticipants, "Tournament full");
        require(fighterContract.ownerOf(fighterId) == msg.sender, "Not fighter owner");
        require(!fighterRegistered[tournamentId][fighterId], "Fighter already registered");

        // Transfer entry fee
        require(legendToken.transferFrom(msg.sender, address(this), tournament.entryFee), "Entry fee transfer failed");

        // Register participant
        tournamentParticipantIds[tournamentId].push(fighterId);
        tournament.prizePool += tournament.entryFee;
        fighterRegistered[tournamentId][fighterId] = true;

        tournamentParticipants[tournamentId][fighterId] = Participant({
            owner: msg.sender,
            fighterId: fighterId,
            wins: 0,
            losses: 0,
            eliminated: false,
            finalRank: 0
        });

        userTournaments[msg.sender].push(tournamentId);
        emit ParticipantRegistered(tournamentId, msg.sender, fighterId);
    }

    // Start tournament - simplified
    function startTournament(uint256 tournamentId) external nonReentrant {
        TournamentInfo storage tournament = tournaments[tournamentId];
        require(tournament.status == TOURNAMENT_STATUS_REGISTRATION, "Tournament not in registration");
        require(tournamentParticipantIds[tournamentId].length >= MIN_PARTICIPANTS, "Not enough participants");
        
        tournament.status = TOURNAMENT_STATUS_ACTIVE;
        tournament.currentRound = 1;
        
        // Shuffle participants
        _shuffleParticipants(tournamentId);
        
        // Generate first round matches
        _generateFirstRoundMatches(tournamentId);
        
        emit TournamentStarted(tournamentId);
    }
    
    // Shuffle participants - simplified
    function _shuffleParticipants(uint256 tournamentId) internal {
        uint256[] storage participants = tournamentParticipantIds[tournamentId];
        
        for (uint256 i = participants.length - 1; i > 0; i--) {
            uint256 j = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, i))) % (i + 1);
            (participants[i], participants[j]) = (participants[j], participants[i]);
        }
    }
    
    // Generate first round matches - simplified
    function _generateFirstRoundMatches(uint256 tournamentId) internal {
        uint256[] storage participants = tournamentParticipantIds[tournamentId];
        
        for (uint256 i = 0; i < participants.length; i += 2) {
            uint256 fighter1Id = participants[i];
            uint256 fighter2Id = i + 1 < participants.length ? participants[i + 1] : 0;
            uint256 matchNumber = i / 2 + 1;
            
            tournamentMatches[tournamentId].push(Match({
                round: 1,
                matchNumber: matchNumber,
                fighter1Id: fighter1Id,
                fighter2Id: fighter2Id,
                winnerId: fighter2Id == 0 ? fighter1Id : 0,
                completed: fighter2Id == 0
            }));
            
            if (fighter2Id == 0) {
                tournamentParticipants[tournamentId][fighter1Id].wins++;
            } else {
                activeTournamentMatches[tournamentId]++;
            }
            
            emit MatchCreated(tournamentId, 1, matchNumber, fighter1Id, fighter2Id);
        }
        
        // If all matches are byes, advance to next round
        if (activeTournamentMatches[tournamentId] == 0) {
            _advanceToNextRound(tournamentId);
        }
    }
    
    // Submit match result - simplified
    function submitMatchResult(
        uint256 tournamentId,
        uint256 matchIndex,
        uint256 winnerId
    ) external nonReentrant {
        TournamentInfo storage tournament = tournaments[tournamentId];
        require(tournament.status == TOURNAMENT_STATUS_ACTIVE, "Tournament not active");
        
        require(matchIndex < tournamentMatches[tournamentId].length, "Invalid match index");
        Match storage currentMatch = tournamentMatches[tournamentId][matchIndex];
        
        require(!currentMatch.completed, "Match already completed");
        require(
            winnerId == currentMatch.fighter1Id || winnerId == currentMatch.fighter2Id,
            "Invalid winner"
        );
        
        // Verify caller is authorized
        address fighter1Owner = fighterContract.ownerOf(currentMatch.fighter1Id);
        address fighter2Owner = fighterContract.ownerOf(currentMatch.fighter2Id);
        
        require(
            msg.sender == fighter1Owner || 
            msg.sender == fighter2Owner || 
            msg.sender == tournament.organizer || 
            msg.sender == owner(),
            "Not authorized"
        );
        
        // Update match result
        currentMatch.winnerId = winnerId;
        currentMatch.completed = true;
        
        // Update participant records
        uint256 loserId = winnerId == currentMatch.fighter1Id ? currentMatch.fighter2Id : currentMatch.fighter1Id;
        
        tournamentParticipants[tournamentId][winnerId].wins++;
        tournamentParticipants[tournamentId][loserId].losses++;
        
        if (tournament.tournamentType == TOURNAMENT_TYPE_SINGLE_ELIMINATION) {
            tournamentParticipants[tournamentId][loserId].eliminated = true;
        }
        
        // Update fighter stats
        fighterContract.addBattleResult(winnerId, loserId);
        
        // Decrement active matches counter
        activeTournamentMatches[tournamentId]--;
        
        emit MatchCompleted(tournamentId, currentMatch.round, currentMatch.matchNumber, winnerId);
        
        // Check if round is complete
        if (activeTournamentMatches[tournamentId] == 0) {
            emit RoundCompleted(tournamentId, currentMatch.round);
            _advanceToNextRound(tournamentId);
        }
    }
    
    // Advance to next round - simplified
    function _advanceToNextRound(uint256 tournamentId) internal {
        TournamentInfo storage tournament = tournaments[tournamentId];
        uint256 currentRound = tournament.currentRound;
        uint256[] memory winners = _getWinnersFromRound(tournamentId, currentRound);
        
        if (winners.length <= 1) {
            // Tournament is complete
            if (winners.length == 1) {
                _completeTournament(tournamentId, winners[0]);
            }
            return;
        }
        
        // Advance to next round
        tournament.currentRound++;
        _generateNextRoundMatches(tournamentId, winners);
    }
    
    // Get winners from round - simplified
    function _getWinnersFromRound(uint256 tournamentId, uint256 round) internal view returns (uint256[] memory) {
        Match[] storage matches = tournamentMatches[tournamentId];
        uint256[] memory winners = new uint256[](matches.length);
        uint256 winnerCount = 0;
        
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].round == round && matches[i].completed) {
                winners[winnerCount] = matches[i].winnerId;
                winnerCount++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](winnerCount);
        for (uint256 i = 0; i < winnerCount; i++) {
            result[i] = winners[i];
        }
        
        return result;
    }
    
    // Generate next round matches - simplified
    function _generateNextRoundMatches(uint256 tournamentId, uint256[] memory winners) internal {
        uint256 nextRound = tournaments[tournamentId].currentRound;
        
        for (uint256 i = 0; i < winners.length; i += 2) {
            uint256 fighter1Id = winners[i];
            uint256 fighter2Id = i + 1 < winners.length ? winners[i + 1] : 0;
            uint256 matchNumber = i / 2 + 1;
            
            tournamentMatches[tournamentId].push(Match({
                round: nextRound,
                matchNumber: matchNumber,
                fighter1Id: fighter1Id,
                fighter2Id: fighter2Id,
                winnerId: fighter2Id == 0 ? fighter1Id : 0,
                completed: fighter2Id == 0
            }));
            
            if (fighter2Id == 0) {
                tournamentParticipants[tournamentId][fighter1Id].wins++;
            } else {
                activeTournamentMatches[tournamentId]++;
            }
            
            emit MatchCreated(tournamentId, nextRound, matchNumber, fighter1Id, fighter2Id);
        }
        
        // If all matches are byes, advance to next round
        if (activeTournamentMatches[tournamentId] == 0) {
            _advanceToNextRound(tournamentId);
        }
    }
    
    // Complete tournament - simplified
    function _completeTournament(uint256 tournamentId, uint256 winnerId) internal {
        TournamentInfo storage tournament = tournaments[tournamentId];
        tournament.status = TOURNAMENT_STATUS_COMPLETED;
        tournamentWinners[tournamentId] = winnerId;
        
        // Set winner's final rank
        tournamentParticipants[tournamentId][winnerId].finalRank = 1;
        
        // Find runner-up (simplified)
        Match[] storage matches = tournamentMatches[tournamentId];
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].round == tournament.currentRound && matches[i].completed) {
                uint256 runnerUpId = matches[i].fighter1Id == winnerId ? 
                    matches[i].fighter2Id : matches[i].fighter1Id;
                tournamentRunnerUps[tournamentId] = runnerUpId;
                tournamentParticipants[tournamentId][runnerUpId].finalRank = 2;
                break;
            }
        }
        
        emit TournamentCompleted(tournamentId, winnerId);
    }
    
    // Distribute prizes - simplified
    function distributePrizes(uint256 tournamentId) external nonReentrant {
        TournamentInfo storage tournament = tournaments[tournamentId];
        require(tournament.status == TOURNAMENT_STATUS_COMPLETED, "Tournament not completed");
        require(!tournament.prizesDistributed, "Prizes already distributed");
        require(
            msg.sender == tournament.organizer || msg.sender == owner(),
            "Not authorized"
        );
        
        tournament.prizesDistributed = true;
        
        uint256 organizerFee = (tournament.prizePool * ORGANIZER_FEE_PERCENT) / 100;
        uint256 remainingPool = tournament.prizePool - organizerFee;
        
        uint256 winnerId = tournamentWinners[tournamentId];
        uint256 runnerUpId = tournamentRunnerUps[tournamentId];
        
        address winner = fighterContract.ownerOf(winnerId);
        
        // Transfer prizes
        uint256 winnerPrize = (remainingPool * WINNER_PRIZE_PERCENT) / 100;
        require(legendToken.transfer(winner, winnerPrize), "Winner prize transfer failed");
        
        // Transfer runner-up prize if there is a runner-up
        if (runnerUpId != 0) {
            uint256 runnerUpPrize = (remainingPool * RUNNER_UP_PRIZE_PERCENT) / 100;
            address runnerUp = fighterContract.ownerOf(runnerUpId);
            require(legendToken.transfer(runnerUp, runnerUpPrize), "Runner-up prize transfer failed");
        }
        
        // Transfer organizer fee
        require(legendToken.transfer(tournament.organizer, organizerFee), "Organizer fee transfer failed");
        
        // Additional tournament reward
        legendToken.mintTournamentReward(winner, legendToken.TOURNAMENT_WIN_REWARD());
        
        emit PrizesDistributed(tournamentId, tournament.prizePool);
    }
    
    // Cancel tournament - simplified
    function cancelTournament(uint256 tournamentId) external nonReentrant {
        TournamentInfo storage tournament = tournaments[tournamentId];
        require(
            msg.sender == tournament.organizer || msg.sender == owner(),
            "Not authorized"
        );
        require(tournament.status != TOURNAMENT_STATUS_COMPLETED, "Cannot cancel completed tournament");
        
        tournament.status = TOURNAMENT_STATUS_CANCELLED;
        
        // Refund entry fees
        uint256[] memory participants = tournamentParticipantIds[tournamentId];
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = fighterContract.ownerOf(participants[i]);
            require(legendToken.transfer(participant, tournament.entryFee), "Refund failed");
        }
        
        tournament.prizePool = 0;
        
        emit TournamentCancelled(tournamentId, "Tournament cancelled");
    }
    
    // Getter functions - simplified
    function getTournament(uint256 tournamentId) external view returns (TournamentInfo memory) {
        return tournaments[tournamentId];
    }
    
    function getTournamentMatches(uint256 tournamentId) external view returns (Match[] memory) {
        return tournamentMatches[tournamentId];
    }
    
    function getTournamentParticipants(uint256 tournamentId) external view returns (uint256[] memory) {
        return tournamentParticipantIds[tournamentId];
    }
    
    function getUserTournaments(address user) external view returns (uint256[] memory) {
        return userTournaments[user];
    }
    
    function getTotalTournaments() external view returns (uint256) {
        return _tournamentIdCounter.current();
    }
}
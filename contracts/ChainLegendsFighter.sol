// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ChainLegendsFighter is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Fighter elements
    enum Element { FIRE, WATER, EARTH, AIR }

    // Fighter stats
    struct FighterStats {
        uint256 health;
        uint256 maxHealth;
        uint256 attack;
        uint256 defense;
        uint256 speed;
        uint256 level;
        Element element;
        uint256 experience;
        uint256 wins;
        uint256 losses;
        uint256 lastBattle;
        bool isActive;
    }

    // Fighter metadata
    struct FighterMetadata {
        string name;
        string description;
        string imageUrl;
        uint256 mintedAt;
        address originalOwner;
    }

    // Mappings
    mapping(uint256 => FighterStats) public fighterStats;
    mapping(uint256 => FighterMetadata) public fighterMetadata;
    mapping(address => bool) public authorizedContracts;

    // Events
    event FighterMinted(uint256 indexed tokenId, address indexed owner, Element element, uint256 level);
    event FighterStatsUpdated(uint256 indexed tokenId, uint256 health, uint256 attack, uint256 defense, uint256 speed);
    event BattleResult(uint256 indexed winnerId, uint256 indexed loserId, uint256 timestamp);
    event FighterLevelUp(uint256 indexed tokenId, uint256 newLevel);

    // Constants
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant BASE_MINT_PRICE = 0.01 ether;

    constructor() ERC721("Chain Legends Fighter", "CLF") Ownable(msg.sender) {}

    /**
     * @dev Mint a new fighter NFT
     * @param to Address to mint the fighter to
     * @param element Fighter element (0-3)
     * @param level Starting level (1-5)
     * @param name Fighter name
     * @param imageUrl Fighter image URL
     */
    function mintFighter(
        address to,
        Element element,
        uint256 level,
        string memory name,
        string memory imageUrl
    ) external payable nonReentrant returns (uint256) {
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        require(level >= 1 && level <= 5, "Invalid level");
        require(msg.value >= getMintPrice(level), "Insufficient payment");
        require(bytes(name).length > 0, "Name cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Generate base stats based on element and level
        FighterStats memory stats = generateBaseStats(element, level);
        fighterStats[tokenId] = stats;

        // Set metadata
        fighterMetadata[tokenId] = FighterMetadata({
            name: name,
            description: string(abi.encodePacked("A Level ", toString(level), " ", getElementName(element), " fighter")),
            imageUrl: imageUrl,
            mintedAt: block.timestamp,
            originalOwner: to
        });

        _safeMint(to, tokenId);

        emit FighterMinted(tokenId, to, element, level);
        return tokenId;
    }

    /**
     * @dev Generate base stats for a fighter
     */
    function generateBaseStats(Element element, uint256 level) internal pure returns (FighterStats memory) {
        uint256 baseHealth = 100 + (level * 20);
        uint256 baseAttack = 50 + (level * 10);
        uint256 baseDefense = 30 + (level * 8);
        uint256 baseSpeed = 40 + (level * 6);

        // Element bonuses
        if (element == Element.FIRE) {
            baseAttack += 15;
            baseSpeed += 10;
        } else if (element == Element.WATER) {
            baseHealth += 20;
            baseDefense += 10;
        } else if (element == Element.EARTH) {
            baseDefense += 20;
            baseHealth += 15;
        } else if (element == Element.AIR) {
            baseSpeed += 20;
            baseAttack += 10;
        }

        return FighterStats({
            health: baseHealth,
            maxHealth: baseHealth,
            attack: baseAttack,
            defense: baseDefense,
            speed: baseSpeed,
            level: level,
            element: element,
            experience: 0,
            wins: 0,
            losses: 0,
            lastBattle: 0,
            isActive: true
        });
    }

    /**
     * @dev Update fighter stats (only authorized contracts)
     */
    function updateFighterStats(
        uint256 tokenId,
        uint256 health,
        uint256 attack,
        uint256 defense,
        uint256 speed
    ) external nonReentrant {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        require(_exists(tokenId), "Fighter does not exist");

        FighterStats storage stats = fighterStats[tokenId];
        stats.health = health;
        stats.attack = attack;
        stats.defense = defense;
        stats.speed = speed;

        emit FighterStatsUpdated(tokenId, health, attack, defense, speed);
    }

    /**
     * @dev Add battle result
     */
    function addBattleResult(uint256 winnerId, uint256 loserId) external nonReentrant {
        require(authorizedContracts[msg.sender] || msg.sender == owner(), "Not authorized");
        require(_exists(winnerId) && _exists(loserId), "Fighter does not exist");

        FighterStats storage winner = fighterStats[winnerId];
        FighterStats storage loser = fighterStats[loserId];

        winner.wins++;
        winner.experience += 100;
        winner.lastBattle = block.timestamp;

        loser.losses++;
        loser.experience += 25;
        loser.lastBattle = block.timestamp;

        // Level up check
        uint256 requiredExp = winner.level * 200;
        if (winner.experience >= requiredExp && winner.level < 10) {
            winner.level++;
            winner.maxHealth += 20;
            winner.attack += 10;
            winner.defense += 8;
            winner.speed += 6;
            winner.health = winner.maxHealth; // Full heal on level up

            emit FighterLevelUp(winnerId, winner.level);
        }

        emit BattleResult(winnerId, loserId, block.timestamp);
    }

    /**
     * @dev Heal fighter to full health
     */
    function healFighter(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(_exists(tokenId), "Fighter does not exist");

        FighterStats storage stats = fighterStats[tokenId];
        stats.health = stats.maxHealth;
    }

    /**
     * @dev Get mint price based on level
     */
    function getMintPrice(uint256 level) public pure returns (uint256) {
        return BASE_MINT_PRICE * level;
    }

    /**
     * @dev Get element name
     */
    function getElementName(Element element) internal pure returns (string memory) {
        if (element == Element.FIRE) return "Fire";
        if (element == Element.WATER) return "Water";
        if (element == Element.EARTH) return "Earth";
        if (element == Element.AIR) return "Air";
        return "Unknown";
    }

    /**
     * @dev Get fighter complete info
     */
    function getFighterInfo(uint256 tokenId) external view returns (
        FighterStats memory stats,
        FighterMetadata memory metadata
    ) {
        require(_exists(tokenId), "Fighter does not exist");
        return (fighterStats[tokenId], fighterMetadata[tokenId]);
    }

    /**
     * @dev Get user's fighters
     */
    function getUserFighters(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokenIds = new uint256[](balance);

        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(user, i);
        }

        return tokenIds;
    }

    /**
     * @dev Authorize contract to modify fighters
     */
    function authorizeContract(address contractAddress, bool authorized) external onlyOwner {
        authorizedContracts[contractAddress] = authorized;
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner nonReentrant {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Convert uint to string
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Helper function to check if a token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    // Override functions for OpenZeppelin v5.x
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract LegendToken is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {

    // Authorized minters (game contracts)
    mapping(address => bool) public authorizedMinters;

    // Reward rates
    uint256 public constant BATTLE_WIN_REWARD = 100 * 10**18; // 100 LEGEND
    uint256 public constant BATTLE_LOSS_REWARD = 25 * 10**18; // 25 LEGEND
    uint256 public constant DAILY_LOGIN_REWARD = 50 * 10**18; // 50 LEGEND
    uint256 public constant TOURNAMENT_WIN_REWARD = 500 * 10**18; // 500 LEGEND

    // Supply limits
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million tokens

    // Events
    event RewardMinted(address indexed recipient, uint256 amount, string reason);
    event MinterAuthorized(address indexed minter, bool authorized);

    constructor() ERC20("Legend Token", "LEGEND") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint tokens for battle rewards
     */
    function mintBattleReward(address winner, address loser) external nonReentrant {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(totalSupply() + BATTLE_WIN_REWARD + BATTLE_LOSS_REWARD <= MAX_SUPPLY, "Exceeds max supply");

        _mint(winner, BATTLE_WIN_REWARD);
        _mint(loser, BATTLE_LOSS_REWARD);

        emit RewardMinted(winner, BATTLE_WIN_REWARD, "Battle Win");
        emit RewardMinted(loser, BATTLE_LOSS_REWARD, "Battle Loss");
    }

    /**
     * @dev Mint tokens for daily login
     */
    function mintDailyReward(address user) external nonReentrant {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(totalSupply() + DAILY_LOGIN_REWARD <= MAX_SUPPLY, "Exceeds max supply");

        _mint(user, DAILY_LOGIN_REWARD);
        emit RewardMinted(user, DAILY_LOGIN_REWARD, "Daily Login");
    }

    /**
     * @dev Mint tokens for tournament rewards
     */
    function mintTournamentReward(address winner, uint256 amount) external nonReentrant {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(amount <= TOURNAMENT_WIN_REWARD * 10, "Amount too high"); // Max 10x tournament reward

        _mint(winner, amount);
        emit RewardMinted(winner, amount, "Tournament Win");
    }

    /**
     * @dev Mint custom reward amount
     */
    function mintReward(address recipient, uint256 amount, string memory reason) external nonReentrant {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(amount <= 10000 * 10**18, "Amount too high"); // Max 10,000 tokens per mint

        _mint(recipient, amount);
        emit RewardMinted(recipient, amount, reason);
    }

    /**
     * @dev Authorize/deauthorize minter
     */
    function setMinterAuthorization(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    /**
     * @dev Emergency mint (owner only, limited)
     */
    function emergencyMint(address recipient, uint256 amount) external onlyOwner nonReentrant {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(amount <= 1000000 * 10**18, "Emergency mint too high"); // Max 1M tokens

        _mint(recipient, amount);
        emit RewardMinted(recipient, amount, "Emergency Mint");
    }

    /**
     * @dev Batch transfer for airdrops
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external nonReentrant {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length <= 200, "Too many recipients");

        for (uint256 i = 0; i < recipients.length; i++) {
            transfer(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Get user's token balance in human readable format
     */
    function getBalanceFormatted(address user) external view returns (uint256) {
        return balanceOf(user) / 10**18;
    }
}
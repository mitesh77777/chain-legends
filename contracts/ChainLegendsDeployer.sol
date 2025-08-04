// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ChainLegendsFighter.sol";
import "./LegendToken.sol";
import "./Tournament.sol";
// Import BattleArena with a different name to avoid conflict
import {BattleArena as BattleArenaContract} from "./BattleArena.sol";

/**
 * @title ChainLegendsDeployer
 * @dev Deployment contract for all Chain Legends contracts
 */
contract ChainLegendsDeployer {
    struct DeployedContracts {
        address fighterContract;
        address legendToken;
        address battleArena;
        address tournament;
        address deployer;
        uint256 deployedAt;
    }

    DeployedContracts public deployedContracts;

    event ContractsDeployed(
        address fighterContract,
        address legendToken,
        address battleArena,
        address tournament,
        address deployer
    );

    constructor() {
        // Deploy LEGEND Token first
        LegendToken legendToken = new LegendToken();

        // Deploy Fighter NFT contract
        ChainLegendsFighter fighterContract = new ChainLegendsFighter();

        // Deploy Battle Arena using the aliased name
        BattleArenaContract battleArena = new BattleArenaContract(
            address(fighterContract),
            address(legendToken)
        );

        // Deploy Tournament contract
        Tournament tournament = new Tournament(
            address(fighterContract),
            address(legendToken)
        );

        // Set up permissions
        legendToken.setMinterAuthorization(address(battleArena), true);
        legendToken.setMinterAuthorization(address(tournament), true);
        fighterContract.authorizeContract(address(battleArena), true);
        fighterContract.authorizeContract(address(tournament), true);

        // Store deployed contract addresses
        deployedContracts = DeployedContracts({
            fighterContract: address(fighterContract),
            legendToken: address(legendToken),
            battleArena: address(battleArena),
            tournament: address(tournament),
            deployer: msg.sender,
            deployedAt: block.timestamp
        });

        // Transfer ownership to deployer
        legendToken.transferOwnership(msg.sender);
        fighterContract.transferOwnership(msg.sender);
        battleArena.transferOwnership(msg.sender);
        tournament.transferOwnership(msg.sender);

        emit ContractsDeployed(
            address(fighterContract),
            address(legendToken),
            address(battleArena),
            address(tournament),
            msg.sender
        );
    }

    /**
     * @dev Get all deployed contract addresses
     */
    function getDeployedContracts() external view returns (DeployedContracts memory) {
        return deployedContracts;
    }

    /**
     * @dev Function to update the deployed contracts if needed
     */
    function updateDeployedContracts(address _fighterContract, address _legendToken, address _battleArena, address _tournament) external {
        require(msg.sender == deployedContracts.deployer, "Only deployer can update contracts");

        deployedContracts.fighterContract = _fighterContract;
        deployedContracts.legendToken = _legendToken;
        deployedContracts.battleArena = _battleArena;
        deployedContracts.tournament = _tournament;
    }
}
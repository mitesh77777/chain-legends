const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Chain Legends Contracts", function () {
  let fighterContract, legendToken, battleArena, tournament;
  let owner, player1, player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy contracts
    const LegendToken = await ethers.getContractFactory("LegendToken");
    legendToken = await LegendToken.deploy();

    const ChainLegendsFighter = await ethers.getContractFactory("ChainLegendsFighter");
    fighterContract = await ChainLegendsFighter.deploy();

    const BattleArena = await ethers.getContractFactory("BattleArena");
    battleArena = await BattleArena.deploy(fighterContract.address, legendToken.address);

    const Tournament = await ethers.getContractFactory("Tournament");
    tournament = await Tournament.deploy(fighterContract.address, legendToken.address);

    // Set up permissions
    await legendToken.setMinterAuthorization(battleArena.address, true);
    await legendToken.setMinterAuthorization(tournament.address, true);
    await fighterContract.authorizeContract(battleArena.address, true);
    await fighterContract.authorizeContract(tournament.address, true);
  });

  describe("Fighter NFT", function () {
    it("Should mint a fighter with correct stats", async function () {
      const mintPrice = await fighterContract.getMintPrice(1);
      
      await fighterContract.connect(player1).mintFighter(
        player1.address,
        0, // Fire element
        1, // Level 1
        "Test Fighter",
        "https://example.com/image.png",
        { value: mintPrice }
      );

      expect(await fighterContract.balanceOf(player1.address)).to.equal(1);
      
      const [stats, metadata] = await fighterContract.getFighterInfo(0);
      expect(stats.level).to.equal(1);
      expect(stats.element).to.equal(0);
      expect(metadata.name).to.equal("Test Fighter");
    });

    it("Should not allow minting without payment", async function () {
      await expect(
        fighterContract.connect(player1).mintFighter(
          player1.address,
          0,
          1,
          "Test Fighter",
          "https://example.com/image.png",
          { value: 0 }
        )
      ).to.be.revertedWith("Insufficient payment");
    });
  });

  describe("LEGEND Token", function () {
    it("Should have correct initial supply", async function () {
      const initialSupply = ethers.utils.parseEther("100000000");
      expect(await legendToken.totalSupply()).to.equal(initialSupply);
    });

    it("Should mint battle rewards correctly", async function () {
      await legendToken.mintBattleReward(player1.address, player2.address);
      
      const winReward = await legendToken.BATTLE_WIN_REWARD();
      const lossReward = await legendToken.BATTLE_LOSS_REWARD();
      
      expect(await legendToken.balanceOf(player1.address)).to.equal(winReward);
      expect(await legendToken.balanceOf(player2.address)).to.equal(lossReward);
    });
  });

  describe("Battle Arena", function () {
    beforeEach(async function () {
      // Mint fighters for testing
      const mintPrice = await fighterContract.getMintPrice(1);
      
      await fighterContract.connect(player1).mintFighter(
        player1.address, 0, 1, "Fighter 1", "image1.png", { value: mintPrice }
      );
      
      await fighterContract.connect(player2).mintFighter(
        player2.address, 1, 1, "Fighter 2", "image2.png", { value: mintPrice }
      );

      // Give players tokens for entry fees
      await legendToken.transfer(player1.address, ethers.utils.parseEther("1000"));
      await legendToken.transfer(player2.address, ethers.utils.parseEther("1000"));
    });

    it("Should create a battle", async function () {
      const entryFee = ethers.utils.parseEther("10");
      
      // Approve entry fees
      await legendToken.connect(player1).approve(battleArena.address, entryFee);
      await legendToken.connect(player2).approve(battleArena.address, entryFee);
      
      await expect(
        battleArena.connect(player1).createBattle(0, 1, entryFee)
      ).to.emit(battleArena, "BattleCreated");
      
      const battle = await battleArena.getBattle(0);
      expect(battle.fighter1Id).to.equal(0);
      expect(battle.fighter2Id).to.equal(1);
    });

    it("Should submit battle result and claim rewards", async function () {
      const entryFee = ethers.utils.parseEther("10");
      
      // Approve and create battle
      await legendToken.connect(player1).approve(battleArena.address, entryFee);
      await legendToken.connect(player2).approve(battleArena.address, entryFee);
      await battleArena.connect(player1).createBattle(0, 1, entryFee);
      
      // Submit battle result
      const battleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("battle_data"));
      await battleArena.connect(player1).submitBattleResult(0, 0, 1, battleHash);
      
      // Claim rewards
      const initialBalance = await legendToken.balanceOf(player1.address);
      await battleArena.connect(player1).claimBattleRewards(0);
      
      const finalBalance = await legendToken.balanceOf(player1.address);
      expect(finalBalance.gt(initialBalance)).to.be.true;
    });
  });

  describe("Integration Test", function () {
    it("Should complete full game flow", async function () {
      // 1. Mint fighters
      const mintPrice = await fighterContract.getMintPrice(2);
      await fighterContract.connect(player1).mintFighter(
        player1.address, 0, 2, "Fire Dragon", "dragon1.png", { value: mintPrice }
      );
      await fighterContract.connect(player2).mintFighter(
        player2.address, 1, 2, "Water Serpent", "serpent1.png", { value: mintPrice }
      );

      // 2. Give tokens for battles
      await legendToken.transfer(player1.address, ethers.utils.parseEther("1000"));
      await legendToken.transfer(player2.address, ethers.utils.parseEther("1000"));

      // 3. Create and complete battle
      const entryFee = ethers.utils.parseEther("50");
      await legendToken.connect(player1).approve(battleArena.address, entryFee);
      await legendToken.connect(player2).approve(battleArena.address, entryFee);
      
      await battleArena.connect(player1).createBattle(0, 1, entryFee);
      
      const battleHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("epic_battle"));
      await battleArena.connect(player1).submitBattleResult(0, 0, 1, battleHash);
      
      // 4. Claim rewards
      await battleArena.connect(player1).claimBattleRewards(0);
      
      // 5. Verify fighter stats updated
      const [stats] = await fighterContract.getFighterInfo(0);
      expect(stats.wins).to.equal(1);
      expect(stats.experience).to.equal(100);

      console.log("✅ Full game flow completed successfully!");
    });
  });
});

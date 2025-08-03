import { Fighter, BattleAction, BattleState, BattleResult, BattleStatus, Element } from '@/types/game'

export class BattleEngine {
  private static readonly TURN_TIME_LIMIT = 10000 // 10 seconds
  private static readonly MAX_TURNS = 20

  static calculateDamage(
    attacker: Fighter, 
    defender: Fighter, 
    action: BattleAction,
    attackerCurrentHealth: number,
    defenderCurrentHealth: number
  ): BattleResult {
    let baseDamage = 0
    let critical = false
    let effect = ''

    switch (action) {
      case BattleAction.ATTACK:
        baseDamage = Math.max(1, attacker.attack - Math.floor(defender.defense / 2))
        critical = Math.random() < 0.15 // 15% crit chance
        if (critical) {
          baseDamage = Math.floor(baseDamage * 1.5)
          effect = 'Critical Hit!'
        }
        break

      case BattleAction.DEFEND:
        baseDamage = 0
        effect = 'Defended! Damage reduced next turn'
        break

      case BattleAction.SPECIAL:
        baseDamage = Math.floor(attacker.attack * 1.3)
        critical = Math.random() < 0.25 // 25% crit chance for special
        if (critical) {
          baseDamage = Math.floor(baseDamage * 1.2)
          effect = 'Special Critical!'
        } else {
          effect = 'Special Attack!'
        }
        break

      case BattleAction.ITEM:
        // For now, items are healing potions
        baseDamage = -Math.floor(attacker.maxHealth * 0.25) // Heal 25%
        effect = 'Used Healing Potion!'
        break
    }

    // Apply elemental advantages
    const elementalMultiplier = this.getElementalMultiplier(attacker.element, defender.element)
    if (elementalMultiplier !== 1 && action !== BattleAction.DEFEND && action !== BattleAction.ITEM) {
      baseDamage = Math.floor(baseDamage * elementalMultiplier)
      if (elementalMultiplier > 1) {
        effect += ' Super Effective!'
      } else if (elementalMultiplier < 1) {
        effect += ' Not very effective...'
      }
    }

    // Calculate final damage and new health
    const finalDamage = Math.max(0, baseDamage)
    let newHealth: number

    if (action === BattleAction.ITEM) {
      // Healing
      newHealth = Math.min(attacker.maxHealth, attackerCurrentHealth - baseDamage)
    } else {
      // Damage
      newHealth = Math.max(0, defenderCurrentHealth - finalDamage)
    }

    return {
      damage: finalDamage,
      critical,
      effect,
      newHealth,
    }
  }

  static processTurn(
    battle: BattleState,
    player1Action: BattleAction,
    player2Action: BattleAction
  ): BattleState {
    const newBattle = { ...battle }
    newBattle.turnNumber += 1
    newBattle.turnDeadline = Date.now() + this.TURN_TIME_LIMIT

    // Determine turn order based on speed (with some randomness)
    const player1Speed = battle.player1.fighter.speed + Math.random() * 10
    const player2Speed = battle.player2.fighter.speed + Math.random() * 10
    
    const player1GoesFirst = player1Speed >= player2Speed

    // Process actions in order
    if (player1GoesFirst) {
      this.processPlayerAction(newBattle, 'player1', player1Action)
      if (newBattle.status === BattleStatus.ACTIVE) {
        this.processPlayerAction(newBattle, 'player2', player2Action)
      }
    } else {
      this.processPlayerAction(newBattle, 'player2', player2Action)
      if (newBattle.status === BattleStatus.ACTIVE) {
        this.processPlayerAction(newBattle, 'player1', player1Action)
      }
    }

    // Check for battle end conditions
    if (newBattle.player1.currentHealth <= 0) {
      newBattle.status = BattleStatus.COMPLETED
      newBattle.winner = 'player2'
    } else if (newBattle.player2.currentHealth <= 0) {
      newBattle.status = BattleStatus.COMPLETED
      newBattle.winner = 'player1'
    } else if (newBattle.turnNumber >= this.MAX_TURNS) {
      // Tie-breaker: higher health percentage wins
      const player1HealthPercent = newBattle.player1.currentHealth / newBattle.player1.fighter.maxHealth
      const player2HealthPercent = newBattle.player2.currentHealth / newBattle.player2.fighter.maxHealth
      
      newBattle.status = BattleStatus.COMPLETED
      newBattle.winner = player1HealthPercent >= player2HealthPercent ? 'player1' : 'player2'
    }

    return newBattle
  }

  private static processPlayerAction(
    battle: BattleState,
    playerId: 'player1' | 'player2',
    action: BattleAction
  ) {
    const attacker = battle[playerId]
    const defender = battle[playerId === 'player1' ? 'player2' : 'player1']

    if (action === BattleAction.ITEM) {
      // Self-targeting action (healing)
      const result = this.calculateDamage(
        attacker.fighter,
        attacker.fighter,
        action,
        attacker.currentHealth,
        attacker.currentHealth
      )
      
      attacker.currentHealth = result.newHealth
      
      battle.actions.push({
        playerId,
        action,
        damage: -result.damage, // Negative for healing
        effect: result.effect,
        timestamp: Date.now(),
      })
    } else {
      // Target opponent
      const result = this.calculateDamage(
        attacker.fighter,
        defender.fighter,
        action,
        attacker.currentHealth,
        defender.currentHealth
      )

      if (action !== BattleAction.DEFEND) {
        defender.currentHealth = result.newHealth
      }

      battle.actions.push({
        playerId,
        action,
        damage: result.damage,
        effect: result.effect,
        timestamp: Date.now(),
      })
    }
  }

  private static getElementalMultiplier(attackerElement: Element, defenderElement: Element): number {
    // Fire > Earth > Air > Water > Fire
    const advantages: Record<Element, Element> = {
      [Element.FIRE]: Element.EARTH,
      [Element.EARTH]: Element.AIR,
      [Element.AIR]: Element.WATER,
      [Element.WATER]: Element.FIRE,
    }

    const weaknesses: Record<Element, Element> = {
      [Element.FIRE]: Element.WATER,
      [Element.WATER]: Element.AIR,
      [Element.AIR]: Element.EARTH,
      [Element.EARTH]: Element.FIRE,
    }

    if (advantages[attackerElement] === defenderElement) {
      return 1.25 // 25% bonus damage
    }
    
    if (weaknesses[attackerElement] === defenderElement) {
      return 0.8 // 20% reduced damage
    }

    return 1 // Neutral damage
  }

  static generateBattleLog(battle: BattleState): string[] {
    const log: string[] = []
    
    log.push(`Battle begins! ${battle.player1.fighter.name} vs ${battle.player2.fighter.name}`)
    
    battle.actions.forEach((action) => {
      const actor = battle[action.playerId].fighter.name
      const actionName = action.action.toUpperCase()
      
      if (action.damage && action.damage > 0) {
        log.push(`${actor} uses ${actionName} for ${action.damage} damage! ${action.effect || ''}`)
      } else if (action.damage && action.damage < 0) {
        log.push(`${actor} uses ${actionName} and heals for ${-action.damage} HP! ${action.effect || ''}`)
      } else {
        log.push(`${actor} uses ${actionName}! ${action.effect || ''}`)
      }
    })

    if (battle.winner) {
      const winner = battle[battle.winner].fighter.name
      log.push(`${winner} wins the battle!`)
    }

    return log
  }

  static calculateExperienceGained(winner: Fighter, loser: Fighter): number {
    // Base XP gain
    let baseXP = 50
    
    // Bonus for defeating higher level opponent
    if (loser.level > winner.level) {
      baseXP += (loser.level - winner.level) * 10
    }
    
    // Random variance
    baseXP += Math.floor(Math.random() * 20) - 10
    
    return Math.max(10, baseXP)
  }

  static shouldLevelUp(fighter: Fighter, newExperience: number): boolean {
    const currentLevel = Math.floor(fighter.experience / 100) + 1
    const newLevel = Math.floor(newExperience / 100) + 1
    return newLevel > currentLevel
  }

  static generateFighterStats(element: Element, level: number = 1): {
    health: number
    attack: number
    defense: number
    speed: number
  } {
    const baseStats = {
      health: 100,
      attack: 20,
      defense: 15,
      speed: 10,
    }

    // Element bonuses
    const elementBonuses: Record<Element, Partial<typeof baseStats>> = {
      [Element.FIRE]: { attack: 5, speed: 3 },
      [Element.WATER]: { health: 10, defense: 3 },
      [Element.EARTH]: { health: 15, defense: 5, speed: -2 },
      [Element.AIR]: { speed: 8, attack: 2, defense: -2 },
    }

    const bonus = elementBonuses[element] || {}
    
    // Apply level scaling
    const levelMultiplier = 1 + ((level - 1) * 0.1)
    
    return {
      health: Math.floor((baseStats.health + (bonus.health || 0)) * levelMultiplier),
      attack: Math.floor((baseStats.attack + (bonus.attack || 0)) * levelMultiplier),
      defense: Math.floor((baseStats.defense + (bonus.defense || 0)) * levelMultiplier),
      speed: Math.floor((baseStats.speed + (bonus.speed || 0)) * levelMultiplier),
    }
  }
}
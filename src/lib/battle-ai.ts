import { Fighter, BattleAction, Element, BattleState } from '@/types/game'

export class BattleAI {
  private static readonly AI_PERSONALITIES = {
    AGGRESSIVE: 'aggressive',
    DEFENSIVE: 'defensive',
    BALANCED: 'balanced',
    TACTICAL: 'tactical'
  } as const

  private static readonly DECISION_WEIGHTS = {
    aggressive: {
      [BattleAction.ATTACK]: 0.5,
      [BattleAction.SPECIAL]: 0.3,
      [BattleAction.DEFEND]: 0.1,
      [BattleAction.ITEM]: 0.1
    },
    defensive: {
      [BattleAction.ATTACK]: 0.2,
      [BattleAction.SPECIAL]: 0.1,
      [BattleAction.DEFEND]: 0.4,
      [BattleAction.ITEM]: 0.3
    },
    balanced: {
      [BattleAction.ATTACK]: 0.3,
      [BattleAction.SPECIAL]: 0.25,
      [BattleAction.DEFEND]: 0.25,
      [BattleAction.ITEM]: 0.2
    },
    tactical: {
      [BattleAction.ATTACK]: 0.25,
      [BattleAction.SPECIAL]: 0.35,
      [BattleAction.DEFEND]: 0.25,
      [BattleAction.ITEM]: 0.15
    }
  }

  static chooseAction(
    aiFighter: Fighter,
    aiCurrentHealth: number,
    opponentFighter: Fighter,
    opponentCurrentHealth: number,
    battleState: BattleState,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): BattleAction {
    const personality = this.determinePersonality(aiFighter, difficulty)
    const baseWeights = { ...this.DECISION_WEIGHTS[personality] }

    // Apply situational modifiers
    this.applySituationalModifiers(
      baseWeights,
      aiFighter,
      aiCurrentHealth,
      opponentFighter,
      opponentCurrentHealth,
      battleState,
      difficulty
    )

    // Choose action based on weighted probabilities
    return this.weightedRandomChoice(baseWeights)
  }

  private static determinePersonality(
    fighter: Fighter,
    difficulty: 'easy' | 'medium' | 'hard'
  ): keyof typeof BattleAI.DECISION_WEIGHTS {
    // Base personality on fighter element and stats
    const { attack, defense, speed, element } = fighter

    if (difficulty === 'easy') {
      return Math.random() < 0.7 ? 'aggressive' : 'balanced'
    }

    // High attack, low defense = aggressive
    if (attack > defense + 5) {
      return attack > speed ? 'aggressive' : 'tactical'
    }
    
    // High defense = defensive
    if (defense > attack + 3) {
      return 'defensive'
    }
    
    // High speed = tactical
    if (speed > (attack + defense) / 2) {
      return 'tactical'
    }

    // Element-based personality traits
    switch (element) {
      case Element.FIRE:
        return Math.random() < 0.6 ? 'aggressive' : 'tactical'
      case Element.WATER:
        return Math.random() < 0.6 ? 'balanced' : 'defensive'
      case Element.EARTH:
        return Math.random() < 0.7 ? 'defensive' : 'balanced'
      case Element.AIR:
        return Math.random() < 0.6 ? 'tactical' : 'aggressive'
      default:
        return 'balanced'
    }
  }

  private static applySituationalModifiers(
    weights: Record<BattleAction, number>,
    aiFighter: Fighter,
    aiCurrentHealth: number,
    opponentFighter: Fighter,
    opponentCurrentHealth: number,
    battleState: BattleState,
    difficulty: 'easy' | 'medium' | 'hard'
  ) {
    const aiHealthPercent = aiCurrentHealth / aiFighter.maxHealth
    const opponentHealthPercent = opponentCurrentHealth / opponentFighter.maxHealth
    const turnNumber = battleState.turnNumber

    // Health-based decisions
    if (aiHealthPercent < 0.3) {
      // Low health - prefer healing and defending
      weights[BattleAction.ITEM] *= 2.5
      weights[BattleAction.DEFEND] *= 1.8
      weights[BattleAction.ATTACK] *= 0.6
      weights[BattleAction.SPECIAL] *= 0.7
    } else if (aiHealthPercent < 0.5) {
      // Medium health - slightly more defensive
      weights[BattleAction.ITEM] *= 1.5
      weights[BattleAction.DEFEND] *= 1.3
    }

    // Opponent health-based decisions
    if (opponentHealthPercent < 0.25) {
      // Opponent is low - go for the kill
      weights[BattleAction.ATTACK] *= 1.8
      weights[BattleAction.SPECIAL] *= 2.0
      weights[BattleAction.DEFEND] *= 0.5
      weights[BattleAction.ITEM] *= 0.3
    }

    // Elemental advantage considerations
    const elementalMultiplier = this.getElementalAdvantage(aiFighter.element, opponentFighter.element)
    if (elementalMultiplier > 1) {
      // We have advantage - be more aggressive
      weights[BattleAction.ATTACK] *= 1.4
      weights[BattleAction.SPECIAL] *= 1.6
    } else if (elementalMultiplier < 1) {
      // We're at disadvantage - be more defensive
      weights[BattleAction.DEFEND] *= 1.5
      weights[BattleAction.ITEM] *= 1.3
    }

    // Turn-based strategy
    if (turnNumber <= 2) {
      // Early game - establish dominance or test opponent
      if (difficulty === 'hard') {
        weights[BattleAction.SPECIAL] *= 1.3
        weights[BattleAction.ATTACK] *= 1.2
      }
    } else if (turnNumber >= 15) {
      // Late game - more desperate/aggressive
      weights[BattleAction.ATTACK] *= 1.5
      weights[BattleAction.SPECIAL] *= 1.3
      weights[BattleAction.DEFEND] *= 0.8
    }

    // Recent action history analysis (avoid being too predictable)
    const recentActions = battleState.actions
      .filter(action => action.playerId === 'player2')
      .slice(-3)
      .map(action => action.action)

    if (recentActions.length >= 2) {
      const lastAction = recentActions[recentActions.length - 1]
      const secondLastAction = recentActions[recentActions.length - 2]
      
      // If we used the same action twice, reduce its weight
      if (lastAction === secondLastAction) {
        weights[lastAction] *= 0.6
      }
      
      // If we haven't used special in a while and have good opportunity
      if (!recentActions.includes(BattleAction.SPECIAL) && aiHealthPercent > 0.4) {
        weights[BattleAction.SPECIAL] *= 1.4
      }
    }

    // Difficulty-based intelligence
    if (difficulty === 'hard') {
      // Hard AI makes smarter counter-play decisions
      const playerRecentActions = battleState.actions
        .filter(action => action.playerId === 'player1')
        .slice(-2)
        .map(action => action.action)

      if (playerRecentActions.includes(BattleAction.ATTACK)) {
        weights[BattleAction.DEFEND] *= 1.3
      }
      if (playerRecentActions.includes(BattleAction.SPECIAL)) {
        weights[BattleAction.DEFEND] *= 1.5
      }
    } else if (difficulty === 'easy') {
      // Easy AI is less strategic
      weights[BattleAction.ATTACK] *= 1.2
      weights[BattleAction.DEFEND] *= 0.8
    }

    // Normalize weights to ensure they sum to a reasonable range
    this.normalizeWeights(weights)
  }

  private static getElementalAdvantage(attackerElement: Element, defenderElement: Element): number {
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
      return 1.25
    }
    if (weaknesses[attackerElement] === defenderElement) {
      return 0.8
    }
    return 1
  }

  private static normalizeWeights(weights: Record<BattleAction, number>) {
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    if (total > 0) {
      Object.keys(weights).forEach(key => {
        weights[key as BattleAction] /= total
      })
    }
  }

  private static weightedRandomChoice(weights: Record<BattleAction, number>): BattleAction {
    const random = Math.random()
    let cumulative = 0

    for (const [action, weight] of Object.entries(weights)) {
      cumulative += weight
      if (random <= cumulative) {
        return action as BattleAction
      }
    }

    // Fallback
    return BattleAction.ATTACK
  }

  static generateBattleQuip(
    action: BattleAction,
    fighter: Fighter,
    result: 'hit' | 'miss' | 'critical' | 'heal' | 'defend'
  ): string {
    const quips: Record<BattleAction, Record<string, string[]>> = {
      [BattleAction.ATTACK]: {
        hit: [
          `${fighter.name} strikes with precision!`,
          `A solid hit from ${fighter.name}!`,
          `${fighter.name} lands a clean attack!`
        ],
        critical: [
          `${fighter.name} finds a weak spot! Critical hit!`,
          `Devastating blow from ${fighter.name}!`,
          `${fighter.name} strikes with perfect technique!`
        ],
        miss: [
          `${fighter.name}'s attack goes wide!`,
          `${fighter.name} swings and misses!`
        ]
      },
      [BattleAction.SPECIAL]: {
        hit: [
          `${fighter.name} unleashes their ${fighter.element} power!`,
          `${fighter.name} channels elemental energy!`,
          `${fighter.name} uses their signature move!`
        ],
        critical: [
          `${fighter.name}'s ${fighter.element} technique is unstoppable!`,
          `Maximum power! ${fighter.name}'s special attack devastates!`
        ]
      },
      [BattleAction.DEFEND]: {
        defend: [
          `${fighter.name} takes a defensive stance!`,
          `${fighter.name} prepares for the next attack!`,
          `${fighter.name} focuses on protection!`
        ]
      },
      [BattleAction.ITEM]: {
        heal: [
          `${fighter.name} recovers their strength!`,
          `${fighter.name} uses a healing item!`,
          `${fighter.name} tends to their wounds!`
        ]
      }
    }

    const actionQuips = quips[action]?.[result] || [`${fighter.name} acts!`]
    return actionQuips[Math.floor(Math.random() * actionQuips.length)]
  }
}

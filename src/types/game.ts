export type Answer = 'si' | 'no' | 'depende'

export interface Player {
  id: string
  name: string
  color: string
  score: number
  hasConfesaCard: boolean
  hasDoubleCard: boolean
}

export interface Dilemma {
  id: number
  text: string
  category: string
}

export interface Round {
  dilemma: Dilemma
  activePlayerId: string
  answer: Answer | null
  predictions: Record<string, Answer>
  doubleBets: Record<string, boolean>
  isLightning: boolean
  lightningAnswers: Record<string, Answer>
  confesaUsedBy: string | null
}

export interface Achievement {
  id: string
  title: string
  description: string
  playerIds: string[]
}

export interface GameStats {
  mostPredictable: { playerId: string; timesGuessed: number } | null
  leastPredictable: { playerId: string; timesFooled: number } | null
  bestPredictor: { playerId: string; correctGuesses: number } | null
  mostDivisive: { dilemma: Dilemma; answers: Record<Answer, number> } | null
  streaks: Record<string, number>
}

export type GamePhase =
  | 'home'
  | 'players'
  | 'pass-phone'
  | 'answer'
  | 'predict'
  | 'reveal'
  | 'lightning-pass'
  | 'lightning-answer'
  | 'lightning-reveal'
  | 'results'

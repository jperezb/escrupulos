export type Answer = 'si' | 'no' | 'depende'

export interface Player {
  id: string
  name: string
  color: string
  score: number
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
}

export type GamePhase =
  | 'home'
  | 'players'
  | 'pass-phone'
  | 'answer'
  | 'predict'
  | 'reveal'
  | 'results'

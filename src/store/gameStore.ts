import { create } from 'zustand'
import type { Answer, Player, Round, GamePhase, Dilemma } from '../types/game'
import { dilemas } from '../data/dilemas'
import { shuffle } from '../utils/shuffle'
import { PLAYER_COLORS } from '../utils/colors'

interface GameState {
  players: Player[]
  rounds: Round[]
  currentRoundIndex: number
  phase: GamePhase
  dilemmaDeck: Dilemma[]
  totalRounds: number
  predictingPlayerIndex: number
  passPhoneTarget: string | null
  nextPhaseAfterPass: GamePhase

  addPlayer: (name: string) => void
  removePlayer: (id: string) => void
  startGame: (rounds?: number) => void
  readyAfterPass: () => void
  submitAnswer: (answer: Answer) => void
  submitPrediction: (prediction: Answer) => void
  nextRound: () => void
  resetGame: () => void
}

function getActivePlayerIndex(players: Player[], roundIndex: number): number {
  return roundIndex % players.length
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  rounds: [],
  currentRoundIndex: 0,
  phase: 'home',
  dilemmaDeck: [],
  totalRounds: 0,
  predictingPlayerIndex: 0,
  passPhoneTarget: null,
  nextPhaseAfterPass: 'answer',

  addPlayer: (name: string) => {
    const { players } = get()
    if (players.length >= 6) return
    const player: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: PLAYER_COLORS[players.length],
      score: 0,
    }
    set({ players: [...players, player] })
  },

  removePlayer: (id: string) => {
    set(state => ({
      players: state.players
        .filter(p => p.id !== id)
        .map((p, i) => ({ ...p, color: PLAYER_COLORS[i] })),
    }))
  },

  startGame: (rounds?: number) => {
    const { players } = get()
    const totalRounds = rounds ?? players.length * 2
    const deck = shuffle(dilemas).slice(0, totalRounds)
    const activePlayer = players[0]

    set({
      dilemmaDeck: deck,
      totalRounds,
      currentRoundIndex: 0,
      rounds: [{
        dilemma: deck[0],
        activePlayerId: activePlayer.id,
        answer: null,
        predictions: {},
      }],
      phase: 'pass-phone',
      passPhoneTarget: activePlayer.id,
      nextPhaseAfterPass: 'answer',
      predictingPlayerIndex: 0,
      players: players.map(p => ({ ...p, score: 0 })),
    })
  },

  readyAfterPass: () => {
    const { nextPhaseAfterPass } = get()
    set({ phase: nextPhaseAfterPass })
  },

  submitAnswer: (answer: Answer) => {
    const { rounds, currentRoundIndex, players } = get()
    const updatedRounds = [...rounds]
    updatedRounds[currentRoundIndex] = {
      ...updatedRounds[currentRoundIndex],
      answer,
    }

    const activePlayerId = updatedRounds[currentRoundIndex].activePlayerId
    const predictors = players.filter(p => p.id !== activePlayerId)
    const firstPredictor = predictors[0]

    set({
      rounds: updatedRounds,
      phase: 'pass-phone',
      passPhoneTarget: firstPredictor.id,
      nextPhaseAfterPass: 'predict',
      predictingPlayerIndex: 0,
    })
  },

  submitPrediction: (prediction: Answer) => {
    const { rounds, currentRoundIndex, players, predictingPlayerIndex } = get()
    const round = rounds[currentRoundIndex]
    const activePlayerId = round.activePlayerId
    const predictors = players.filter(p => p.id !== activePlayerId)
    const currentPredictor = predictors[predictingPlayerIndex]

    const updatedRounds = [...rounds]
    updatedRounds[currentRoundIndex] = {
      ...round,
      predictions: {
        ...round.predictions,
        [currentPredictor.id]: prediction,
      },
    }

    const nextPredictorIndex = predictingPlayerIndex + 1

    if (nextPredictorIndex >= predictors.length) {
      // All predictions done — calculate scores and reveal
      const answer = updatedRounds[currentRoundIndex].answer!
      const predictions = updatedRounds[currentRoundIndex].predictions
      const updatedPlayers = players.map(p => {
        let bonus = 0
        if (p.id === activePlayerId) {
          // Answerer gets 1 point per wrong prediction
          bonus = Object.values(predictions).filter(pred => pred !== answer).length
        } else if (predictions[p.id] === answer) {
          bonus = 1
        }
        return { ...p, score: p.score + bonus }
      })

      set({
        rounds: updatedRounds,
        players: updatedPlayers,
        phase: 'reveal',
      })
    } else {
      const nextPredictor = predictors[nextPredictorIndex]
      set({
        rounds: updatedRounds,
        predictingPlayerIndex: nextPredictorIndex,
        phase: 'pass-phone',
        passPhoneTarget: nextPredictor.id,
        nextPhaseAfterPass: 'predict',
      })
    }
  },

  nextRound: () => {
    const { currentRoundIndex, totalRounds, players, dilemmaDeck } = get()
    const nextIndex = currentRoundIndex + 1

    if (nextIndex >= totalRounds) {
      set({ phase: 'results' })
      return
    }

    const activePlayerIdx = getActivePlayerIndex(players, nextIndex)
    const activePlayer = players[activePlayerIdx]

    set(state => ({
      currentRoundIndex: nextIndex,
      rounds: [...state.rounds, {
        dilemma: dilemmaDeck[nextIndex],
        activePlayerId: activePlayer.id,
        answer: null,
        predictions: {},
      }],
      phase: 'pass-phone',
      passPhoneTarget: activePlayer.id,
      nextPhaseAfterPass: 'answer',
      predictingPlayerIndex: 0,
    }))
  },

  resetGame: () => {
    set({
      players: [],
      rounds: [],
      currentRoundIndex: 0,
      phase: 'home',
      dilemmaDeck: [],
      totalRounds: 0,
      predictingPlayerIndex: 0,
      passPhoneTarget: null,
      nextPhaseAfterPass: 'answer',
    })
  },
}))

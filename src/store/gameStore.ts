import { create } from 'zustand'
import type { Answer, Player, Round, GamePhase, Dilemma, Achievement, GameStats } from '../types/game'
import { dilemas } from '../data/dilemas'
import { shuffle } from '../utils/shuffle'
import { PLAYER_COLORS } from '../utils/colors'

const LIGHTNING_EVERY = 4 // Every 4th round is lightning
const TIMER_SECONDS = 30

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
  lightningPlayerIndex: number
  timerSeconds: number
  achievements: Achievement[]
  stats: GameStats

  addPlayer: (name: string) => void
  removePlayer: (id: string) => void
  startGame: (rounds?: number, includeMature?: boolean) => void
  readyAfterPass: () => void
  submitAnswer: (answer: Answer) => void
  submitPrediction: (prediction: Answer, useDouble: boolean) => void
  submitLightningAnswer: (answer: Answer) => void
  useConfesaCard: (byPlayerId: string) => void
  nextRound: () => void
  resetGame: () => void
  computeEndGameStats: () => void
}

function getActivePlayerIndex(players: Player[], roundIndex: number): number {
  return roundIndex % players.length
}

function isLightningRound(roundIndex: number): boolean {
  return roundIndex > 0 && (roundIndex + 1) % LIGHTNING_EVERY === 0
}

function createRound(dilemma: Dilemma, activePlayerId: string, lightning: boolean): Round {
  return {
    dilemma,
    activePlayerId,
    answer: null,
    predictions: {},
    doubleBets: {},
    isLightning: lightning,
    lightningAnswers: {},
    confesaUsedBy: null,
  }
}

function computeAchievements(players: Player[], rounds: Round[]): Achievement[] {
  const achievements: Achievement[] = []
  const normalRounds = rounds.filter(r => !r.isLightning && r.answer)

  // Track per-player stats
  const timesNobodyGuessed: Record<string, number> = {}
  const correctStreaks: Record<string, number> = {}
  const maxStreaks: Record<string, number> = {}
  const correctGuesses: Record<string, number> = {}
  const totalAsAnswerer: Record<string, number> = {}
  const timesGuessedCorrectly: Record<string, number> = {}

  for (const p of players) {
    timesNobodyGuessed[p.id] = 0
    correctStreaks[p.id] = 0
    maxStreaks[p.id] = 0
    correctGuesses[p.id] = 0
    totalAsAnswerer[p.id] = 0
    timesGuessedCorrectly[p.id] = 0
  }

  for (const round of normalRounds) {
    const answer = round.answer!
    const predictors = players.filter(p => p.id !== round.activePlayerId)
    const allWrong = predictors.every(p => round.predictions[p.id] !== answer)

    totalAsAnswerer[round.activePlayerId] = (totalAsAnswerer[round.activePlayerId] || 0) + 1

    if (allWrong) {
      timesNobodyGuessed[round.activePlayerId] = (timesNobodyGuessed[round.activePlayerId] || 0) + 1
    }

    for (const p of predictors) {
      const correct = round.predictions[p.id] === answer
      if (correct) {
        correctGuesses[p.id] = (correctGuesses[p.id] || 0) + 1
        correctStreaks[p.id] = (correctStreaks[p.id] || 0) + 1
        if (correctStreaks[p.id] > (maxStreaks[p.id] || 0)) {
          maxStreaks[p.id] = correctStreaks[p.id]
        }
        timesGuessedCorrectly[round.activePlayerId] = (timesGuessedCorrectly[round.activePlayerId] || 0) + 1
      } else {
        correctStreaks[p.id] = 0
      }
    }
  }

  // El Impredecible - nobody guessed correctly 3+ times
  const unpredictable = players.filter(p => (timesNobodyGuessed[p.id] || 0) >= 3)
  if (unpredictable.length > 0) {
    achievements.push({
      id: 'unpredictable',
      title: 'El Impredecible',
      description: 'Nadie acerto tu respuesta 3 o mas veces',
      playerIds: unpredictable.map(p => p.id),
    })
  }

  // El Psicologo - guessed correctly 5+ times
  const psychologists = players.filter(p => (correctGuesses[p.id] || 0) >= 5)
  if (psychologists.length > 0) {
    achievements.push({
      id: 'psychologist',
      title: 'El Psicologo',
      description: 'Acertaste 5 o mas predicciones',
      playerIds: psychologists.map(p => p.id),
    })
  }

  // Racha Ganadora - streak of 3+ correct predictions
  const streakers = players.filter(p => (maxStreaks[p.id] || 0) >= 3)
  if (streakers.length > 0) {
    achievements.push({
      id: 'streak',
      title: 'Racha Ganadora',
      description: 'Acertaste 3 predicciones seguidas',
      playerIds: streakers.map(p => p.id),
    })
  }

  // Libro Abierto - most predictable (guessed correctly by others the most, relative to times as answerer)
  let mostPredictableId = ''
  let mostPredictableRatio = 0
  for (const p of players) {
    const total = totalAsAnswerer[p.id] || 0
    if (total >= 2) {
      const ratio = (timesGuessedCorrectly[p.id] || 0) / total
      if (ratio > mostPredictableRatio) {
        mostPredictableRatio = ratio
        mostPredictableId = p.id
      }
    }
  }
  if (mostPredictableId && mostPredictableRatio >= 0.7) {
    achievements.push({
      id: 'open-book',
      title: 'Libro Abierto',
      description: 'Fuiste el jugador mas predecible',
      playerIds: [mostPredictableId],
    })
  }

  // Apostador Exitoso - won a double bet
  const doubleWinners = new Set<string>()
  for (const round of normalRounds) {
    const answer = round.answer!
    for (const [playerId, isDouble] of Object.entries(round.doubleBets)) {
      if (isDouble && round.predictions[playerId] === answer) {
        doubleWinners.add(playerId)
      }
    }
  }
  if (doubleWinners.size > 0) {
    achievements.push({
      id: 'lucky-gambler',
      title: 'Apostador Exitoso',
      description: 'Ganaste una apuesta doble',
      playerIds: [...doubleWinners],
    })
  }

  return achievements
}

function computeStats(players: Player[], rounds: Round[]): GameStats {
  const normalRounds = rounds.filter(r => !r.isLightning && r.answer)
  const stats: GameStats = {
    mostPredictable: null,
    leastPredictable: null,
    bestPredictor: null,
    mostDivisive: null,
    streaks: {},
  }

  const timesGuessedCorrectly: Record<string, number> = {}
  const timesAsAnswerer: Record<string, number> = {}
  const correctGuesses: Record<string, number> = {}

  for (const round of normalRounds) {
    const answer = round.answer!
    timesAsAnswerer[round.activePlayerId] = (timesAsAnswerer[round.activePlayerId] || 0) + 1

    for (const p of players) {
      if (p.id === round.activePlayerId) continue
      if (round.predictions[p.id] === answer) {
        correctGuesses[p.id] = (correctGuesses[p.id] || 0) + 1
        timesGuessedCorrectly[round.activePlayerId] = (timesGuessedCorrectly[round.activePlayerId] || 0) + 1
      }
    }
  }

  // Most predictable
  let maxRatio = 0
  for (const p of players) {
    const total = timesAsAnswerer[p.id] || 0
    if (total >= 1) {
      const ratio = (timesGuessedCorrectly[p.id] || 0) / total
      if (ratio > maxRatio) {
        maxRatio = ratio
        stats.mostPredictable = { playerId: p.id, timesGuessed: timesGuessedCorrectly[p.id] || 0 }
      }
    }
  }

  // Least predictable
  let minRatio = Infinity
  for (const p of players) {
    const total = timesAsAnswerer[p.id] || 0
    if (total >= 1) {
      const fooled = (players.length - 1) * total - (timesGuessedCorrectly[p.id] || 0)
      const ratio = (timesGuessedCorrectly[p.id] || 0) / total
      if (ratio < minRatio) {
        minRatio = ratio
        stats.leastPredictable = { playerId: p.id, timesFooled: fooled }
      }
    }
  }

  // Best predictor
  let maxCorrect = 0
  for (const p of players) {
    const correct = correctGuesses[p.id] || 0
    if (correct > maxCorrect) {
      maxCorrect = correct
      stats.bestPredictor = { playerId: p.id, correctGuesses: correct }
    }
  }

  // Most divisive dilemma (from lightning rounds)
  const lightningRounds = rounds.filter(r => r.isLightning && Object.keys(r.lightningAnswers).length > 0)
  let maxSpread = 0
  for (const round of lightningRounds) {
    const counts: Record<Answer, number> = { si: 0, no: 0, depende: 0 }
    for (const a of Object.values(round.lightningAnswers)) {
      counts[a]++
    }
    const values = Object.values(counts).filter(v => v > 0)
    const spread = values.length
    if (spread > maxSpread) {
      maxSpread = spread
      stats.mostDivisive = { dilemma: round.dilemma, answers: counts }
    }
  }

  return stats
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
  lightningPlayerIndex: 0,
  timerSeconds: TIMER_SECONDS,
  achievements: [],
  stats: { mostPredictable: null, leastPredictable: null, bestPredictor: null, mostDivisive: null, streaks: {} },

  addPlayer: (name: string) => {
    const { players } = get()
    if (players.length >= 6) return
    const player: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: PLAYER_COLORS[players.length],
      score: 0,
      hasConfesaCard: true,
      hasDoubleCard: true,
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

  startGame: (rounds?: number, includeMature?: boolean) => {
    const { players } = get()
    const totalRounds = rounds ?? players.length * 3
    const pool = includeMature ? dilemas.filter(d => d.mature) : dilemas.filter(d => !d.mature)
    const deck = shuffle(pool).slice(0, totalRounds)
    const activePlayer = players[0]
    const lightning = isLightningRound(0)

    set({
      dilemmaDeck: deck,
      totalRounds,
      currentRoundIndex: 0,
      rounds: [createRound(deck[0], activePlayer.id, lightning)],
      phase: lightning ? 'lightning-pass' : 'pass-phone',
      passPhoneTarget: lightning ? players[0].id : activePlayer.id,
      nextPhaseAfterPass: lightning ? 'lightning-answer' : 'answer',
      predictingPlayerIndex: 0,
      lightningPlayerIndex: 0,
      timerSeconds: TIMER_SECONDS,
      achievements: [],
      stats: { mostPredictable: null, leastPredictable: null, bestPredictor: null, mostDivisive: null, streaks: {} },
      players: players.map(p => ({ ...p, score: 0, hasConfesaCard: true, hasDoubleCard: true })),
    })
  },

  readyAfterPass: () => {
    const { nextPhaseAfterPass } = get()
    set({ phase: nextPhaseAfterPass, timerSeconds: TIMER_SECONDS })
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

  submitPrediction: (prediction: Answer, useDouble: boolean) => {
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
      doubleBets: {
        ...round.doubleBets,
        ...(useDouble ? { [currentPredictor.id]: true } : {}),
      },
    }

    // Consume the double card
    let updatedPlayers = players
    if (useDouble) {
      updatedPlayers = players.map(p =>
        p.id === currentPredictor.id ? { ...p, hasDoubleCard: false } : p
      )
    }

    const nextPredictorIndex = predictingPlayerIndex + 1

    if (nextPredictorIndex >= predictors.length) {
      // All predictions done — calculate scores and reveal
      const answer = updatedRounds[currentRoundIndex].answer!
      const predictions = updatedRounds[currentRoundIndex].predictions
      const doubleBets = updatedRounds[currentRoundIndex].doubleBets
      const scoredPlayers = updatedPlayers.map(p => {
        let bonus = 0
        if (p.id === activePlayerId) {
          // Answerer gets 1 point per wrong prediction
          bonus = Object.entries(predictions).filter(([, pred]) => pred !== answer).length
        } else if (predictions[p.id] === answer) {
          bonus = doubleBets[p.id] ? 2 : 1
        } else if (doubleBets[p.id]) {
          bonus = -1
        }
        return { ...p, score: p.score + bonus }
      })

      set({
        rounds: updatedRounds,
        players: scoredPlayers,
        phase: 'reveal',
      })
    } else {
      const nextPredictor = predictors[nextPredictorIndex]
      set({
        rounds: updatedRounds,
        players: updatedPlayers,
        predictingPlayerIndex: nextPredictorIndex,
        phase: 'pass-phone',
        passPhoneTarget: nextPredictor.id,
        nextPhaseAfterPass: 'predict',
      })
    }
  },

  submitLightningAnswer: (answer: Answer) => {
    const { rounds, currentRoundIndex, players, lightningPlayerIndex } = get()
    const round = rounds[currentRoundIndex]
    const currentPlayer = players[lightningPlayerIndex]

    const updatedRounds = [...rounds]
    updatedRounds[currentRoundIndex] = {
      ...round,
      lightningAnswers: {
        ...round.lightningAnswers,
        [currentPlayer.id]: answer,
      },
    }

    const nextPlayerIndex = lightningPlayerIndex + 1

    if (nextPlayerIndex >= players.length) {
      // All answered — find majority and score
      const answers = updatedRounds[currentRoundIndex].lightningAnswers
      const counts: Record<Answer, string[]> = { si: [], no: [], depende: [] }
      for (const [playerId, a] of Object.entries(answers)) {
        counts[a].push(playerId)
      }
      // Majority answer
      const majority = (Object.entries(counts) as [Answer, string[]][])
        .sort((a, b) => b[1].length - a[1].length)[0]

      const updatedPlayers = players.map(p => {
        if (majority[1].includes(p.id)) {
          return { ...p, score: p.score + 1 }
        }
        return p
      })

      set({
        rounds: updatedRounds,
        players: updatedPlayers,
        phase: 'lightning-reveal',
      })
    } else {
      const nextPlayer = players[nextPlayerIndex]
      set({
        rounds: updatedRounds,
        lightningPlayerIndex: nextPlayerIndex,
        phase: 'lightning-pass',
        passPhoneTarget: nextPlayer.id,
        nextPhaseAfterPass: 'lightning-answer',
      })
    }
  },

  useConfesaCard: (byPlayerId: string) => {
    const { rounds, currentRoundIndex, players } = get()
    const updatedRounds = [...rounds]
    updatedRounds[currentRoundIndex] = {
      ...updatedRounds[currentRoundIndex],
      confesaUsedBy: byPlayerId,
    }
    const updatedPlayers = players.map(p =>
      p.id === byPlayerId ? { ...p, hasConfesaCard: false } : p
    )
    set({ rounds: updatedRounds, players: updatedPlayers })
  },

  nextRound: () => {
    const { currentRoundIndex, totalRounds, players, dilemmaDeck } = get()
    const nextIndex = currentRoundIndex + 1

    if (nextIndex >= totalRounds) {
      get().computeEndGameStats()
      set({ phase: 'results' })
      return
    }

    const lightning = isLightningRound(nextIndex)
    const activePlayerIdx = getActivePlayerIndex(players, nextIndex)
    const activePlayer = players[activePlayerIdx]

    set(state => ({
      currentRoundIndex: nextIndex,
      rounds: [...state.rounds, createRound(dilemmaDeck[nextIndex], activePlayer.id, lightning)],
      phase: lightning ? 'lightning-pass' : 'pass-phone',
      passPhoneTarget: lightning ? players[0].id : activePlayer.id,
      nextPhaseAfterPass: lightning ? 'lightning-answer' : 'answer',
      predictingPlayerIndex: 0,
      lightningPlayerIndex: 0,
      timerSeconds: TIMER_SECONDS,
    }))
  },

  computeEndGameStats: () => {
    const { players, rounds } = get()
    const achievements = computeAchievements(players, rounds)
    const stats = computeStats(players, rounds)
    set({ achievements, stats })
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
      lightningPlayerIndex: 0,
      timerSeconds: TIMER_SECONDS,
      achievements: [],
      stats: { mostPredictable: null, leastPredictable: null, bestPredictor: null, mostDivisive: null, streaks: {} },
    })
  },
}))

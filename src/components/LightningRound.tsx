import { useGameStore } from '../store/gameStore'
import DilemmaCard from './DilemmaCard'
import AnswerSelector from './AnswerSelector'
import Timer from './Timer'
import type { Answer } from '../types/game'

const ANSWER_LABELS: Record<Answer, string> = {
  si: 'Si',
  no: 'No',
  depende: 'Depende',
}

const ANSWER_COLORS: Record<Answer, string> = {
  si: 'text-emerald-400',
  no: 'text-rose-400',
  depende: 'text-amber-400',
}

const ANSWER_BG: Record<Answer, string> = {
  si: 'bg-emerald-500/20 border-emerald-500/40',
  no: 'bg-rose-500/20 border-rose-500/40',
  depende: 'bg-amber-500/20 border-amber-500/40',
}

export function LightningAnswer() {
  const players = useGameStore(s => s.players)
  const lightningPlayerIndex = useGameStore(s => s.lightningPlayerIndex)
  const rounds = useGameStore(s => s.rounds)
  const currentRoundIndex = useGameStore(s => s.currentRoundIndex)
  const submitLightningAnswer = useGameStore(s => s.submitLightningAnswer)

  const round = rounds[currentRoundIndex]
  const currentPlayer = players[lightningPlayerIndex]
  if (!currentPlayer || !round) return null

  const handleTimeout = () => {
    // Auto-submit "depende" on timeout
    submitLightningAnswer('depende')
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="inline-block px-4 py-1.5 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full mb-3 animate-pulse">
          RONDA RELAMPAGO
        </span>
        <p className="text-gray-400 text-sm">
          <span className="font-bold text-white">{currentPlayer.name}</span>, responde rapido:
        </p>
      </div>
      <Timer seconds={15} onTimeout={handleTimeout} running={true} />
      <DilemmaCard text={round.dilemma.text} category={round.dilemma.category} />
      <AnswerSelector onSelect={submitLightningAnswer} />
    </div>
  )
}

export function LightningReveal() {
  const players = useGameStore(s => s.players)
  const rounds = useGameStore(s => s.rounds)
  const currentRoundIndex = useGameStore(s => s.currentRoundIndex)
  const nextRound = useGameStore(s => s.nextRound)
  const totalRounds = useGameStore(s => s.totalRounds)

  const round = rounds[currentRoundIndex]
  if (!round) return null

  const answers = round.lightningAnswers
  const counts: Record<Answer, string[]> = { si: [], no: [], depende: [] }
  for (const [playerId, a] of Object.entries(answers)) {
    counts[a].push(playerId)
  }
  const majority = (Object.entries(counts) as [Answer, string[]][])
    .sort((a, b) => b[1].length - a[1].length)[0]

  const isLastRound = currentRoundIndex + 1 >= totalRounds

  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="inline-block px-4 py-1.5 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full mb-3">
          RONDA RELAMPAGO - RESULTADOS
        </span>
      </div>

      <DilemmaCard text={round.dilemma.text} category={round.dilemma.category} />

      <div className="text-center py-2">
        <p className="text-gray-400 text-sm mb-1">Respuesta mayoritaria:</p>
        <p className={`text-3xl font-bold ${ANSWER_COLORS[majority[0]]}`}>
          {ANSWER_LABELS[majority[0]]}
        </p>
        <p className="text-gray-500 text-xs mt-1">+1 punto para la mayoria</p>
      </div>

      <div className="space-y-2">
        {players.map(player => {
          const answer = answers[player.id]
          if (!answer) return null
          const inMajority = majority[1].includes(player.id)
          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                inMajority ? ANSWER_BG[answer] : 'bg-surface-light border-transparent'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-surface text-xs shrink-0"
                style={{ backgroundColor: player.color }}
              >
                {player.name[0].toUpperCase()}
              </div>
              <span className="flex-1 text-sm">{player.name}</span>
              <span className={`font-bold text-sm ${ANSWER_COLORS[answer]}`}>
                {ANSWER_LABELS[answer]}
              </span>
              <span className="text-sm">{inMajority ? '+1' : ''}</span>
            </div>
          )
        })}
      </div>

      <button
        onClick={nextRound}
        className="w-full px-8 py-4 bg-brand-400 hover:bg-brand-300 text-surface font-bold text-lg rounded-2xl transition-all active:scale-95"
      >
        {isLastRound ? 'Ver resultados' : 'Siguiente ronda'}
      </button>
    </div>
  )
}

import { useGameStore } from '../store/gameStore'
import DilemmaCard from './DilemmaCard'
import type { Player, Round, Answer } from '../types/game'

interface Props {
  round: Round
  activePlayer: Player
}

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

export default function RevealPhase({ round, activePlayer }: Props) {
  const players = useGameStore(s => s.players)
  const nextRound = useGameStore(s => s.nextRound)
  const currentRoundIndex = useGameStore(s => s.currentRoundIndex)
  const totalRounds = useGameStore(s => s.totalRounds)

  const answer = round.answer!
  const predictors = players.filter(p => p.id !== activePlayer.id)
  const isLastRound = currentRoundIndex + 1 >= totalRounds

  return (
    <div className="space-y-6">
      <DilemmaCard text={round.dilemma.text} category={round.dilemma.category} />

      <div className="text-center py-4">
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-bold" style={{ color: activePlayer.color }}>
            {activePlayer.name}
          </span>{' '}
          respondio:
        </p>
        <p className={`text-4xl font-bold ${ANSWER_COLORS[answer]}`}>
          {ANSWER_LABELS[answer]}
        </p>
      </div>

      <div className="space-y-2">
        {predictors.map(predictor => {
          const prediction = round.predictions[predictor.id]
          if (!prediction) return null
          const correct = prediction === answer

          return (
            <div
              key={predictor.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-surface-light'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-surface text-xs shrink-0"
                style={{ backgroundColor: predictor.color }}
              >
                {predictor.name[0].toUpperCase()}
              </div>
              <span className="flex-1 text-sm">{predictor.name}</span>
              <span className={`font-bold text-sm ${ANSWER_COLORS[prediction]}`}>
                {ANSWER_LABELS[prediction]}
              </span>
              <span className="text-lg">{correct ? '+1' : ''}</span>
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

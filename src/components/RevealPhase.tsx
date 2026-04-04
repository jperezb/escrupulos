import { useState } from 'react'
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
  const [revealed, setRevealed] = useState(false)
  const players = useGameStore(s => s.players)
  const nextRound = useGameStore(s => s.nextRound)
  const useConfesaCard = useGameStore(s => s.useConfesaCard)
  const currentRoundIndex = useGameStore(s => s.currentRoundIndex)
  const totalRounds = useGameStore(s => s.totalRounds)

  const answer = round.answer!
  const predictors = players.filter(p => p.id !== activePlayer.id)
  const isLastRound = currentRoundIndex + 1 >= totalRounds

  if (!revealed) {
    return (
      <div className="space-y-6">
        <DilemmaCard text={round.dilemma.text} category={round.dilemma.category} />
        <div className="flex justify-center">
          <button
            onClick={() => setRevealed(true)}
            className="px-10 py-4 bg-brand-400 hover:bg-brand-300 text-surface font-bold text-lg rounded-2xl transition-all active:scale-95 animate-bounce"
          >
            Revelar respuesta
          </button>
        </div>
      </div>
    )
  }

  const confesaPlayer = round.confesaUsedBy
    ? players.find(p => p.id === round.confesaUsedBy)
    : null

  return (
    <div className="space-y-5">
      <DilemmaCard text={round.dilemma.text} category={round.dilemma.category} />

      <div className="text-center py-3">
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-bold" style={{ color: activePlayer.color }}>
            {activePlayer.name}
          </span>{' '}
          respondio:
        </p>
        <p className={`text-4xl font-bold animate-flip-in ${ANSWER_COLORS[answer]}`}>
          {ANSWER_LABELS[answer]}
        </p>
      </div>

      <div className="space-y-2">
        {predictors.map(predictor => {
          const prediction = round.predictions[predictor.id]
          if (!prediction) return null
          const correct = prediction === answer
          const doubled = round.doubleBets[predictor.id]
          let pointsText = ''
          if (correct) {
            pointsText = doubled ? '+2' : '+1'
          } else if (doubled) {
            pointsText = '-1'
          }

          return (
            <div
              key={predictor.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl animate-fade-in ${
                correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-surface-light'
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-surface text-xs shrink-0"
                style={{ backgroundColor: predictor.color }}
              >
                {predictor.name[0].toUpperCase()}
              </div>
              <span className="flex-1 text-sm">
                {predictor.name}
                {doubled && <span className="ml-1 text-violet-400 text-xs">x2</span>}
              </span>
              <span className={`font-bold text-sm ${ANSWER_COLORS[prediction]}`}>
                {ANSWER_LABELS[prediction]}
              </span>
              <span className={`text-sm font-bold ${correct ? 'text-emerald-400' : doubled ? 'text-rose-400' : ''}`}>
                {pointsText}
              </span>
            </div>
          )
        })}
      </div>

      {/* Confiesa card section */}
      {!round.confesaUsedBy && (
        <div className="space-y-2">
          {predictors.filter(p => p.hasConfesaCard).map(predictor => (
            <button
              key={predictor.id}
              onClick={() => useConfesaCard(predictor.id)}
              className="w-full py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-sm font-medium hover:bg-rose-500/20 transition-all"
            >
              {predictor.name}: Usar carta CONFIESA (1 uso)
            </button>
          ))}
        </div>
      )}

      {confesaPlayer && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center animate-fade-in">
          <p className="text-rose-300 font-bold text-sm mb-1">CONFIESA</p>
          <p className="text-gray-300 text-sm">
            <span className="font-bold" style={{ color: confesaPlayer.color }}>{confesaPlayer.name}</span> exige que{' '}
            <span className="font-bold" style={{ color: activePlayer.color }}>{activePlayer.name}</span>{' '}
            explique su respuesta
          </p>
        </div>
      )}

      <button
        onClick={nextRound}
        className="w-full px-8 py-4 bg-brand-400 hover:bg-brand-300 text-surface font-bold text-lg rounded-2xl transition-all active:scale-95"
      >
        {isLastRound ? 'Ver resultados' : 'Siguiente ronda'}
      </button>
    </div>
  )
}

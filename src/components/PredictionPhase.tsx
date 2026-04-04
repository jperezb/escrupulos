import { useGameStore } from '../store/gameStore'
import DilemmaCard from './DilemmaCard'
import AnswerSelector from './AnswerSelector'
import type { Player, Round } from '../types/game'

interface Props {
  round: Round
  activePlayer: Player
}

export default function PredictionPhase({ round, activePlayer }: Props) {
  const players = useGameStore(s => s.players)
  const predictingPlayerIndex = useGameStore(s => s.predictingPlayerIndex)
  const submitPrediction = useGameStore(s => s.submitPrediction)

  const predictors = players.filter(p => p.id !== activePlayer.id)
  const currentPredictor = predictors[predictingPlayerIndex]

  if (!currentPredictor) return null

  return (
    <div className="space-y-6">
      <p className="text-center text-gray-400 text-sm">
        <span className="font-bold text-white">{currentPredictor.name}</span>,
        {' '}que crees que respondio{' '}
        <span className="font-bold" style={{ color: activePlayer.color }}>
          {activePlayer.name}
        </span>?
      </p>
      <DilemmaCard text={round.dilemma.text} category={round.dilemma.category} />
      <AnswerSelector onSelect={submitPrediction} />
    </div>
  )
}

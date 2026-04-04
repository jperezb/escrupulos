import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import DilemmaCard from './DilemmaCard'
import Timer from './Timer'
import type { Player, Round, Answer } from '../types/game'

interface Props {
  round: Round
  activePlayer: Player
}

export default function PredictionPhase({ round, activePlayer }: Props) {
  const [useDouble, setUseDouble] = useState(false)
  const players = useGameStore(s => s.players)
  const predictingPlayerIndex = useGameStore(s => s.predictingPlayerIndex)
  const submitPrediction = useGameStore(s => s.submitPrediction)

  const predictors = players.filter(p => p.id !== activePlayer.id)
  const currentPredictor = predictors[predictingPlayerIndex]

  if (!currentPredictor) return null

  const handleSelect = (answer: Answer) => {
    submitPrediction(answer, useDouble)
    setUseDouble(false)
  }

  const handleTimeout = () => {
    submitPrediction('depende', useDouble)
    setUseDouble(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-400 text-sm">
        <span className="font-bold text-white">{currentPredictor.name}</span>,
        {' '}que crees que respondio{' '}
        <span className="font-bold" style={{ color: activePlayer.color }}>
          {activePlayer.name}
        </span>?
      </p>

      <Timer seconds={30} onTimeout={handleTimeout} running={true} />

      <DilemmaCard text={round.dilemma.text} category={round.dilemma.category} />

      {currentPredictor.hasDoubleCard && (
        <button
          onClick={() => setUseDouble(!useDouble)}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all border ${
            useDouble
              ? 'bg-violet-500/20 border-violet-400 text-violet-300'
              : 'bg-surface-light border-surface-lighter text-gray-400 hover:text-gray-200'
          }`}
        >
          {useDouble ? 'APUESTA DOBLE ACTIVADA (x2 si aciertas, -1 si fallas)' : 'Usar Apuesta Doble (1 uso)'}
        </button>
      )}

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleSelect('si')}
          className="py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-xl transition-all active:scale-95"
        >
          Si
        </button>
        <button
          onClick={() => handleSelect('no')}
          className="py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold text-lg rounded-xl transition-all active:scale-95"
        >
          No
        </button>
        <button
          onClick={() => handleSelect('depende')}
          className="py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg rounded-xl transition-all active:scale-95"
        >
          Depende
        </button>
      </div>
    </div>
  )
}

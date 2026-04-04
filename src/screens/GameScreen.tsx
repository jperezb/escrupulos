import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import PassPhone from '../components/PassPhone'
import DilemmaCard from '../components/DilemmaCard'
import AnswerSelector from '../components/AnswerSelector'
import PredictionPhase from '../components/PredictionPhase'
import RevealPhase from '../components/RevealPhase'
import ScoreBoard from '../components/ScoreBoard'
import Timer from '../components/Timer'
import { LightningAnswer, LightningReveal } from '../components/LightningRound'

export default function GameScreen() {
  const navigate = useNavigate()
  const phase = useGameStore(s => s.phase)
  const currentRoundIndex = useGameStore(s => s.currentRoundIndex)
  const totalRounds = useGameStore(s => s.totalRounds)
  const rounds = useGameStore(s => s.rounds)
  const players = useGameStore(s => s.players)

  useEffect(() => {
    if (phase === 'home' || phase === 'players') {
      navigate('/')
    } else if (phase === 'results') {
      navigate('/resultados')
    }
  }, [phase, navigate])

  const currentRound = rounds[currentRoundIndex]
  if (!currentRound) return null

  const activePlayer = players.find(p => p.id === currentRound.activePlayerId)
  if (!activePlayer) return null

  const isLightning = currentRound.isLightning

  return (
    <div className="flex flex-col min-h-full px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Ronda {currentRoundIndex + 1} / {totalRounds}
          </span>
          {isLightning && (
            <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full">
              RELAMPAGO
            </span>
          )}
        </div>
        <ScoreBoard />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {(phase === 'pass-phone' || phase === 'lightning-pass') && <PassPhone />}

        {phase === 'answer' && (
          <div className="space-y-4">
            <p className="text-center text-gray-400 text-sm">
              <span className="font-bold text-white">{activePlayer.name}</span>, responde en secreto:
            </p>
            <Timer
              seconds={30}
              onTimeout={() => useGameStore.getState().submitAnswer('depende')}
              running={true}
            />
            <DilemmaCard text={currentRound.dilemma.text} category={currentRound.dilemma.category} />
            <AnswerSelector onSelect={useGameStore.getState().submitAnswer} />
          </div>
        )}

        {phase === 'predict' && (
          <PredictionPhase round={currentRound} activePlayer={activePlayer} />
        )}

        {phase === 'reveal' && (
          <RevealPhase round={currentRound} activePlayer={activePlayer} />
        )}

        {phase === 'lightning-answer' && <LightningAnswer />}
        {phase === 'lightning-reveal' && <LightningReveal />}
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

export default function HomeScreen() {
  const navigate = useNavigate()
  const resetGame = useGameStore(s => s.resetGame)

  const handleStart = () => {
    resetGame()
    navigate('/jugadores')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      <div className="mb-8 text-center">
        <div className="text-6xl mb-4 select-none" aria-hidden="true">?</div>
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
          Escrupulos
        </h1>
        <p className="text-gray-400 mt-3 text-lg">
          El juego de los dilemas morales
        </p>
      </div>

      <button
        onClick={handleStart}
        className="w-full max-w-xs px-8 py-4 bg-brand-400 hover:bg-brand-300 text-surface font-bold text-lg rounded-2xl transition-all active:scale-95 shadow-lg shadow-brand-400/20"
      >
        Nueva Partida
      </button>

      <div className="mt-12 text-gray-500 text-sm max-w-xs text-center leading-relaxed">
        <p className="font-medium text-gray-400 mb-2">Como jugar</p>
        <p>
          Un jugador responde un dilema moral. Los demas intentan predecir su respuesta.
          Gana quien mejor conozca a sus amigos.
        </p>
      </div>
    </div>
  )
}

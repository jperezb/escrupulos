import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

export default function ResultsScreen() {
  const navigate = useNavigate()
  const players = useGameStore(s => s.players)
  const resetGame = useGameStore(s => s.resetGame)
  const startGame = useGameStore(s => s.startGame)

  const sorted = [...players].sort((a, b) => b.score - a.score)
  const maxScore = sorted[0]?.score ?? 0

  const handlePlayAgain = () => {
    startGame()
    navigate('/juego')
  }

  const handleNewGame = () => {
    resetGame()
    navigate('/')
  }

  return (
    <div className="flex flex-col items-center min-h-full px-6 py-8">
      <div className="text-4xl mb-2 select-none" aria-hidden="true">&#127942;</div>
      <h1 className="text-3xl font-bold mb-8">Resultados</h1>

      <div className="w-full space-y-3 mb-10">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
              i === 0 && maxScore > 0
                ? 'bg-brand-400/20 border border-brand-400/40'
                : 'bg-surface-light'
            }`}
          >
            <span className="text-2xl font-bold text-gray-500 w-8 text-center">
              {i + 1}
            </span>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-surface text-sm shrink-0"
              style={{ backgroundColor: player.color }}
            >
              {player.name[0].toUpperCase()}
            </div>
            <span className="flex-1 font-medium">{player.name}</span>
            <span className="text-2xl font-bold text-brand-300">
              {player.score}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full space-y-3 mt-auto">
        <button
          onClick={handlePlayAgain}
          className="w-full px-8 py-4 bg-brand-400 hover:bg-brand-300 text-surface font-bold text-lg rounded-2xl transition-all active:scale-95"
        >
          Jugar de nuevo
        </button>
        <button
          onClick={handleNewGame}
          className="w-full px-8 py-4 bg-surface-light hover:bg-surface-lighter text-gray-300 font-bold text-lg rounded-2xl transition-all active:scale-95"
        >
          Nueva partida
        </button>
      </div>
    </div>
  )
}

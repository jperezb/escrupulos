import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import Confetti from '../components/Confetti'
import type { Answer } from '../types/game'

const ANSWER_LABELS: Record<Answer, string> = {
  si: 'Si',
  no: 'No',
  depende: 'Depende',
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  'unpredictable': '🎭',
  'psychologist': '🧠',
  'streak': '🔥',
  'open-book': '📖',
  'lucky-gambler': '🎲',
}

export default function ResultsScreen() {
  const navigate = useNavigate()
  const players = useGameStore(s => s.players)
  const resetGame = useGameStore(s => s.resetGame)
  const startGame = useGameStore(s => s.startGame)
  const achievements = useGameStore(s => s.achievements)
  const stats = useGameStore(s => s.stats)

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

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name ?? '?'
  const getPlayerColor = (id: string) => players.find(p => p.id === id)?.color ?? '#888'

  return (
    <div className="flex flex-col items-center min-h-full px-6 py-8">
      <Confetti />

      <div className="text-4xl mb-2 select-none" aria-hidden="true">&#127942;</div>
      <h1 className="text-3xl font-bold mb-8 animate-flip-in">Resultados</h1>

      {/* Scoreboard */}
      <div className="w-full space-y-3 mb-8">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all animate-fade-in ${
              i === 0 && maxScore > 0
                ? 'bg-brand-400/20 border border-brand-400/40'
                : 'bg-surface-light'
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
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

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="w-full mb-8">
          <h2 className="text-lg font-bold mb-3 text-gray-300">Logros</h2>
          <div className="space-y-2">
            {achievements.map(a => (
              <div key={a.id} className="bg-surface-light rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{ACHIEVEMENT_ICONS[a.id] ?? '⭐'}</span>
                  <span className="font-bold text-brand-300">{a.title}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{a.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {a.playerIds.map(id => (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded-full text-xs font-bold text-surface"
                      style={{ backgroundColor: getPlayerColor(id) }}
                    >
                      {getPlayerName(id)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="w-full mb-8">
        <h2 className="text-lg font-bold mb-3 text-gray-300">Estadisticas</h2>
        <div className="grid grid-cols-1 gap-2">
          {stats.bestPredictor && (
            <div className="bg-surface-light rounded-xl p-3 flex items-center gap-3">
              <span className="text-lg">🎯</span>
              <div>
                <p className="text-sm font-bold" style={{ color: getPlayerColor(stats.bestPredictor.playerId) }}>
                  {getPlayerName(stats.bestPredictor.playerId)}
                </p>
                <p className="text-xs text-gray-400">
                  Mejor predictor ({stats.bestPredictor.correctGuesses} aciertos)
                </p>
              </div>
            </div>
          )}

          {stats.mostPredictable && (
            <div className="bg-surface-light rounded-xl p-3 flex items-center gap-3">
              <span className="text-lg">📖</span>
              <div>
                <p className="text-sm font-bold" style={{ color: getPlayerColor(stats.mostPredictable.playerId) }}>
                  {getPlayerName(stats.mostPredictable.playerId)}
                </p>
                <p className="text-xs text-gray-400">
                  Mas predecible ({stats.mostPredictable.timesGuessed} veces adivinado)
                </p>
              </div>
            </div>
          )}

          {stats.leastPredictable && (
            <div className="bg-surface-light rounded-xl p-3 flex items-center gap-3">
              <span className="text-lg">🎭</span>
              <div>
                <p className="text-sm font-bold" style={{ color: getPlayerColor(stats.leastPredictable.playerId) }}>
                  {getPlayerName(stats.leastPredictable.playerId)}
                </p>
                <p className="text-xs text-gray-400">
                  Menos predecible ({stats.leastPredictable.timesFooled} veces engano)
                </p>
              </div>
            </div>
          )}

          {stats.mostDivisive && (
            <div className="bg-surface-light rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💥</span>
                <p className="text-sm font-bold text-brand-300">Pregunta mas divisiva</p>
              </div>
              <p className="text-xs text-gray-300 mb-2">"{stats.mostDivisive.dilemma.text}"</p>
              <div className="flex gap-2 text-xs">
                {(Object.entries(stats.mostDivisive.answers) as [Answer, number][])
                  .filter(([, count]) => count > 0)
                  .map(([answer, count]) => (
                    <span key={answer} className="px-2 py-0.5 bg-surface-lighter rounded-full text-gray-300">
                      {ANSWER_LABELS[answer]}: {count}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
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

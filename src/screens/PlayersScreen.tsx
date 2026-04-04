import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

export default function PlayersScreen() {
  const [name, setName] = useState('')
  const navigate = useNavigate()
  const players = useGameStore(s => s.players)
  const addPlayer = useGameStore(s => s.addPlayer)
  const removePlayer = useGameStore(s => s.removePlayer)
  const startGame = useGameStore(s => s.startGame)

  const handleAdd = () => {
    if (name.trim() && players.length < 6) {
      addPlayer(name)
      setName('')
    }
  }

  const handleStart = () => {
    startGame()
    navigate('/juego')
  }

  return (
    <div className="flex flex-col min-h-full px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">Jugadores</h1>
      <p className="text-gray-400 text-center mb-8 text-sm">2 a 6 jugadores</p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nombre del jugador"
          maxLength={20}
          className="flex-1 px-4 py-3 bg-surface-light border border-surface-lighter rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-400 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || players.length >= 6}
          className="px-5 py-3 bg-brand-400 hover:bg-brand-300 disabled:opacity-30 disabled:hover:bg-brand-400 text-surface font-bold rounded-xl transition-all active:scale-95"
        >
          +
        </button>
      </div>

      <div className="flex-1 space-y-2">
        {players.map(player => (
          <div
            key={player.id}
            className="flex items-center gap-3 px-4 py-3 bg-surface-light rounded-xl"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-surface text-sm shrink-0"
              style={{ backgroundColor: player.color }}
            >
              {player.name[0].toUpperCase()}
            </div>
            <span className="flex-1 font-medium">{player.name}</span>
            <button
              onClick={() => removePlayer(player.id)}
              className="text-gray-500 hover:text-red-400 transition-colors text-xl leading-none"
            >
              x
            </button>
          </div>
        ))}

        {players.length === 0 && (
          <p className="text-gray-600 text-center py-8">
            Agrega al menos 2 jugadores para comenzar
          </p>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={players.length < 2}
        className="mt-6 w-full px-8 py-4 bg-brand-400 hover:bg-brand-300 disabled:opacity-30 disabled:hover:bg-brand-400 text-surface font-bold text-lg rounded-2xl transition-all active:scale-95"
      >
        Comenzar ({players.length * 3} rondas)
      </button>
    </div>
  )
}

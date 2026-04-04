import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function ScoreBoard() {
  const [open, setOpen] = useState(false)
  const players = useGameStore(s => s.players)
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-1.5 bg-surface-light border border-surface-lighter rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
      >
        Puntos
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-surface-light border border-surface-lighter rounded-xl shadow-xl p-3 space-y-2">
            {sorted.map(player => (
              <div key={player.id} className="flex items-center gap-2 text-sm">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-surface text-xs shrink-0"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name[0].toUpperCase()}
                </div>
                <span className="flex-1 truncate">{player.name}</span>
                <span className="font-bold text-brand-300">{player.score}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

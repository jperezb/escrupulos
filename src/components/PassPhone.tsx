import { useGameStore } from '../store/gameStore'

export default function PassPhone() {
  const players = useGameStore(s => s.players)
  const passPhoneTarget = useGameStore(s => s.passPhoneTarget)
  const readyAfterPass = useGameStore(s => s.readyAfterPass)

  const targetPlayer = players.find(p => p.id === passPhoneTarget)
  if (!targetPlayer) return null

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-surface"
        style={{ backgroundColor: targetPlayer.color }}
      >
        {targetPlayer.name[0].toUpperCase()}
      </div>

      <div>
        <p className="text-gray-400 text-lg mb-1">Pasa el telefono a</p>
        <p className="text-3xl font-bold">{targetPlayer.name}</p>
      </div>

      <button
        onClick={readyAfterPass}
        className="w-full max-w-xs px-8 py-4 bg-brand-400 hover:bg-brand-300 text-surface font-bold text-lg rounded-2xl transition-all active:scale-95"
      >
        Listo
      </button>
    </div>
  )
}

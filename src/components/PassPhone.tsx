import { useGameStore } from '../store/gameStore'

export default function PassPhone() {
  const players = useGameStore(s => s.players)
  const passPhoneTarget = useGameStore(s => s.passPhoneTarget)
  const readyAfterPass = useGameStore(s => s.readyAfterPass)
  const phase = useGameStore(s => s.phase)
  const rounds = useGameStore(s => s.rounds)
  const currentRoundIndex = useGameStore(s => s.currentRoundIndex)

  const targetPlayer = players.find(p => p.id === passPhoneTarget)
  if (!targetPlayer) return null

  const isLightning = rounds[currentRoundIndex]?.isLightning

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      {isLightning && (phase === 'lightning-pass') && (
        <span className="inline-block px-4 py-1.5 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full animate-pulse">
          RONDA RELAMPAGO
        </span>
      )}

      <div
        className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-surface animate-fade-in"
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

import type { Answer } from '../types/game'

interface AnswerSelectorProps {
  onSelect: (answer: Answer) => void
}

export default function AnswerSelector({ onSelect }: AnswerSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        onClick={() => onSelect('si')}
        className="py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg rounded-xl transition-all active:scale-95"
      >
        Si
      </button>
      <button
        onClick={() => onSelect('no')}
        className="py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold text-lg rounded-xl transition-all active:scale-95"
      >
        No
      </button>
      <button
        onClick={() => onSelect('depende')}
        className="py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold text-lg rounded-xl transition-all active:scale-95"
      >
        Depende
      </button>
    </div>
  )
}

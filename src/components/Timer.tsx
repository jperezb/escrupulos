import { useState, useEffect, useCallback } from 'react'

interface TimerProps {
  seconds: number
  onTimeout: () => void
  running: boolean
}

export default function Timer({ seconds, onTimeout, running }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    setTimeLeft(seconds)
  }, [seconds])

  const handleTimeout = useCallback(onTimeout, [onTimeout])

  useEffect(() => {
    if (!running) return
    if (timeLeft <= 0) {
      handleTimeout()
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, running, handleTimeout])

  const pct = (timeLeft / seconds) * 100
  const isLow = timeLeft <= 10
  const isCritical = timeLeft <= 5

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold tabular-nums ${isCritical ? 'text-rose-400 animate-pulse' : isLow ? 'text-amber-400' : 'text-gray-400'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="w-full h-1.5 bg-surface-lighter rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-brand-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

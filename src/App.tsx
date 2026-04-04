import { Routes, Route, Navigate } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import PlayersScreen from './screens/PlayersScreen'
import GameScreen from './screens/GameScreen'
import ResultsScreen from './screens/ResultsScreen'

export default function App() {
  return (
    <div className="w-full max-w-md min-h-full">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/jugadores" element={<PlayersScreen />} />
        <Route path="/juego" element={<GameScreen />} />
        <Route path="/resultados" element={<ResultsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

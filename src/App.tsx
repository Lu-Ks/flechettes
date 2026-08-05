import { Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { ScrollToTop } from './layout/ScrollToTop'
import { Home } from './routes/Home/Home'
import { PlayerSetup } from './routes/PlayerSetup/PlayerSetup'
import { Game } from './routes/Game/Game'
import { Result } from './routes/Result/Result'
import { PlayersScreen } from './routes/Players/PlayersScreen'
import { StatsScreen } from './routes/Stats/StatsScreen'
import { SettingsScreen } from './routes/Settings/SettingsScreen'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<PlayerSetup />} />
          <Route path="/joueurs" element={<PlayersScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
          <Route path="/reglages" element={<SettingsScreen />} />
        </Route>
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </>
  )
}

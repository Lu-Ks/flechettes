import { useEffect, useState } from 'react'
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader'
import { getSettings, saveSettings, resetAllData, type AppSettings } from '../../storage/localStorage'
import { useInstallPrompt } from '../../state/useInstallPrompt'
import './SettingsScreen.css'

export function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>(getSettings)
  const { installed, canPromptInstall, promptInstall, isIos } = useInstallPrompt()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch }
    setSettings(next)
    saveSettings(next)
  }

  function handleReset() {
    if (confirm('Effacer toutes les données (joueurs, parties, historique) ? Cette action est irréversible.')) {
      resetAllData()
      window.location.href = '/'
    }
  }

  return (
    <div className="settings-screen">
      <ScreenHeader title="Réglages" />

      <div className="settings-screen__section">
        <label className="settings-screen__row">
          <span>Thème sombre</span>
          <input
            type="checkbox"
            checked={settings.theme === 'dark'}
            onChange={(e) => update({ theme: e.target.checked ? 'dark' : 'light' })}
          />
        </label>
        <label className="settings-screen__row">
          <span>Sons</span>
          <input type="checkbox" checked={settings.sound} onChange={(e) => update({ sound: e.target.checked })} />
        </label>
        <label className="settings-screen__row">
          <span>Vibrations</span>
          <input
            type="checkbox"
            checked={settings.vibration}
            onChange={(e) => update({ vibration: e.target.checked })}
          />
        </label>
      </div>

      <div className="settings-screen__section">
        <p className="settings-screen__section-title">Valeurs par défaut</p>
        <label className="settings-screen__row">
          <span>Score de départ</span>
          <select
            value={settings.defaultStartScore}
            onChange={(e) => update({ defaultStartScore: Number(e.target.value) as 301 | 501 })}
          >
            <option value={301}>301</option>
            <option value={501}>501</option>
          </select>
        </label>
        <label className="settings-screen__row">
          <span>Finir sur un double</span>
          <input
            type="checkbox"
            checked={settings.defaultDoubleOut}
            onChange={(e) => update({ defaultDoubleOut: e.target.checked })}
          />
        </label>
        <label className="settings-screen__row">
          <span>Mode poursuite</span>
          <input
            type="checkbox"
            checked={settings.defaultPursuitMode}
            onChange={(e) => update({ defaultPursuitMode: e.target.checked })}
          />
        </label>
      </div>

      {!installed && (canPromptInstall || isIos) && (
        <div className="settings-screen__section">
          <p className="settings-screen__section-title">Installer l'application</p>
          {canPromptInstall && (
            <button type="button" className="settings-screen__install" onClick={promptInstall}>
              Installer MORI SCORE
            </button>
          )}
          {isIos && (
            <p className="settings-screen__install-hint">
              Sur iPhone/iPad : appuie sur <strong>Partager</strong> (l'icône carrée avec une flèche) puis <strong>Sur l'écran
              d'accueil</strong>.
            </p>
          )}
        </div>
      )}

      <button type="button" className="settings-screen__reset" onClick={handleReset}>
        Réinitialiser toutes les données
      </button>
    </div>
  )
}

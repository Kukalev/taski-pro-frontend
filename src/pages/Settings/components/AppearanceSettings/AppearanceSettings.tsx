import { SettingsSection } from '../SettingsSection'
import { ColorSchemeSelector } from './components/ColorSchemeSelector'

export const AppearanceSettings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Внешний вид</h1>
      
      <SettingsSection title="Цветовая схема">
        <ColorSchemeSelector />
      </SettingsSection>
    </div>
  )
}
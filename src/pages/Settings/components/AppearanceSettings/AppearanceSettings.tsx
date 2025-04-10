import {ColorSchemeSelector} from './components/ColorSchemeSelector'
import { ColorThemes } from './components/ColorThemes';
import { BgThemes } from './components/BgThemes';

export const AppearanceSettings = () => {
  return (
    <div className="bg-white rounded-2xl shadow px-6 py-5 max-w-[500px]">

      <h3 className="text-lg font-medium mb-4">Цветовая схема</h3>
      <ColorSchemeSelector />

      <ColorThemes />

      <BgThemes />
    </div>
  )
}
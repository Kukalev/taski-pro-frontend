import {ColorSchemeSelector} from './components/ColorSchemeSelector'
import { ColorThemes } from './components/ColorThemes';

export const AppearanceSettings = () => {
  return (
    <div className="bg-white rounded-2xl shadow px-5 py-4 max-w-[400px] -ml-2 -mt-2.5">

      <h3 className="text-lg font-medium mb-4">Цветовая схема</h3>
      <ColorSchemeSelector />

      <ColorThemes />
    </div>
  )
}
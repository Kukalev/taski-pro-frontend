import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {applyTheme, mainColor} from './styles/theme'


// Применяем тему при монтировании приложения
applyTheme(mainColor)

createRoot(document.getElementById('root')!).render(
  <App />
)

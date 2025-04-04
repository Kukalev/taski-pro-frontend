import { SettingsSection } from '../SettingsSection'
import { PasswordChange } from './components/PasswordChange'
import { DeleteAccount } from './components/DeleteAccount'
import { AuthService } from '../../../../services/auth/Auth'

export const SecuritySettings = () => {
  const handleLogout = () => {
    AuthService.logout()
    window.location.href = '/login'
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Аутентификация</h1>
      
      <SettingsSection title="Изменение пароля">
        <PasswordChange />
      </SettingsSection>
      
      <SettingsSection title="Способы авторизации">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0077FF] text-white rounded-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2z"/>
            </svg>
            Подключить
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white rounded-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2z"/>
            </svg>
            Подключить
          </button>
        </div>
      </SettingsSection>
      
      <SettingsSection title="Удаление аккаунта">
        <DeleteAccount onLogout={handleLogout} />
      </SettingsSection>
    </div>
  )
} 
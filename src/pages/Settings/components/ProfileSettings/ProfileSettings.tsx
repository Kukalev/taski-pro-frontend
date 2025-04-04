import { UserAvatar } from './components/UserAvatar'
import { ProfileForm } from './components/ProfileForm'
import { AuthService } from '../../../../services/auth/Auth'

export const ProfileSettings = () => {
  const username = AuthService.getUsername() || 'User'
  const email = localStorage.getItem('email') || 'kukalevna22@mail.ru'
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Профиль</h1>
      
      <p className="text-gray-600 mb-4">
        Здесь настраивается учетная запись WEEEK. Профиль для рабочего пространства меняется <a href="#" className="text-blue-600 hover:underline">в разделе «Пользователи»</a>
      </p>
      
      <div className="flex justify-center mb-6">
        <UserAvatar username={username} />
      </div>
      
      <ProfileForm username={username} email={email} />
    </div>
  )
} 
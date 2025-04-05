import {UserAvatar} from './components/UserAvatar'
import {ProfileForm} from './components/ProfileForm'
import {AuthService} from '../../../../services/auth/Auth'

export const ProfileSettings = () => {
  const username = AuthService.getUsername() || 'User'
  const email = localStorage.getItem('email') || 'example@mail.com'
  
  return (
    <div className="bg-white rounded-2xl shadow px-5 py-4 max-w-[430px] -ml-2 -mt-2.5">
      <h1 className="text-[20px] font-medium mb-1 ">Профиль</h1>

      <p className="text-gray-600 mb-4 text-sm">
        Здесь настраивается учетная запись TASKI.PRO.
      </p>

      <div className="flex mb-4">
        <UserAvatar username={username} size='lg'/>
      </div>

      <div>
        <ProfileForm username={username} email={email} />
      </div>
    </div>
  )
} 
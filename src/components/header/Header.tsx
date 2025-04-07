import {AuthService} from '../../services/auth/Auth'
import {HeaderButtons} from './components/HeaderButtons'
import {HeaderIcons} from './components/HeaderIcons'
import {HeaderLogo} from './components/HeaderLogo'
import {UserAvatar} from './components/UserAvatar'
import {useNavigate} from 'react-router-dom'
import {useSidebar} from '../../contexts/SidebarContext'
import { useAuth } from '../../contexts/AuthContext'

export const Header = () => {
	const { currentUser } = useAuth();
	const username = currentUser?.username || AuthService.getUsername();
	const email = currentUser?.email || 'no-email@example.com';
	const navigate = useNavigate()
	const { toggleSidebar } = useSidebar()

	const handleLogout = () => {
		AuthService.logout()
	}

	const handleProClick = () => {
		console.log('Открыть страницу PRO')
	}

	const handleInviteClick = () => {
		console.log('Открыть окно приглашения команды')
	}
	
	const handleSettingsClick = () => {
		navigate('/settings')
	}

	return (
		<header className='w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4'>
			{/* Левая часть с логотипом и названием */}
			<HeaderLogo onToggleSidebar={toggleSidebar} />

			{/* Правая часть с кнопками и аватаром */}
			<div className='flex items-center'>
				{/* Кнопки */}
				<HeaderButtons onProClick={handleProClick} onInviteClick={handleInviteClick} />

				{/* Иконки */}
				<HeaderIcons />

				{/* Аватар пользователя */}
				<UserAvatar 
					username={username} 
					email={email}
					onLogout={handleLogout} 
					onSettingsClick={handleSettingsClick}
				/>
			</div>
		</header>
	)
}

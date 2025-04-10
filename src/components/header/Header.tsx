import {HeaderButtons} from './components/HeaderButtons'
import {HeaderIcons} from './components/HeaderIcons'
import {HeaderLogo} from './components/HeaderLogo'
import {UserAvatar} from './components/UserAvatar'
import {useNavigate} from 'react-router-dom'
import {useSidebar} from '../../contexts/SidebarContext'
import {useAuth} from '../../contexts/AuthContext'

export const Header = () => {
	const { currentUser, avatarObjectUrl, logout } = useAuth();
	const navigate = useNavigate()
	const { toggleSidebar } = useSidebar()

	const username = currentUser?.username || 'User';
	const email = currentUser?.email;

	const handleLogout = () => {
		logout();
		navigate('/login');
	}

	const handleProClick = () => {
		navigate('/settings/subscriptions');
	}


	
	const handleSettingsClick = () => {
		navigate('/settings')
	}

	return (
		<header className='w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4'>
			<HeaderLogo onToggleSidebar={toggleSidebar} />

			<div className='flex items-center'>
				<HeaderButtons onProClick={handleProClick}  />

				<HeaderIcons />

				<UserAvatar
					username={username} 
					email={email}
					avatarUrl={avatarObjectUrl}
					onLogout={handleLogout} 
					onSettingsClick={handleSettingsClick}
				/>
			</div>
		</header>
	)
}

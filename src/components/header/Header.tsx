import {AuthService} from '../../services/auth/Auth'
import {HeaderButtons} from './components/HeaderButtons'
import {HeaderIcons} from './components/HeaderIcons'
import {HeaderLogo} from './components/HeaderLogo'
import {UserAvatar} from './components/UserAvatar'

export const Header = () => {
	const username = AuthService.getUsername()

	const handleLogout = () => {
		AuthService.logout()
	}

	const handleProClick = () => {
		console.log('Открыть страницу PRO')
	}

	const handleInviteClick = () => {
		console.log('Открыть окно приглашения команды')
	}

	return (
		<header className='w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4'>
			{/* Левая часть с логотипом и названием */}
			<HeaderLogo />

			{/* Правая часть с кнопками и аватаром */}
			<div className='flex items-center'>
				{/* Кнопки */}
				<HeaderButtons onProClick={handleProClick} onInviteClick={handleInviteClick} />

				{/* Иконки */}
				<HeaderIcons />

				{/* Аватар пользователя */}
				<UserAvatar username={username} onLogout={handleLogout} />
			</div>
		</header>
	)
}

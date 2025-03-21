import {useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button'

export const Welcome = () => {
	const navigate = useNavigate()

	const handleClick = () => {
		navigate('/welcome/team')
	}

	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 font-["Inter",sans-serif]'>
			<div className='text-center max-w-2xl mx-auto mb-15'>
				<h1 className='text-[28px] font-semibold text-gray-800 mb-6'>Добро пожаловать в TASKI.PRO</h1>
				<p className='text-gray-600 mb-1 font-[550]'>Один сервис для работы с Задачами, </p>
				<p className='text-gray-600 mb-10 font-[550]'>Базой знаний, CRM и Аналитикой</p>
				<Button
					onClick={handleClick}
					className='w-44 h-11 text-white  bg-[linear-gradient(135deg,#c2d8fd_0%,#6c78f4_50%,#c2d8fd_100%)] hover:opacity-90 shadow-[0_2px_12px_rgba(107,138,253,0.35)] rounded-xl'>
					Начать
				</Button>
			</div>
		</div>
	)
}

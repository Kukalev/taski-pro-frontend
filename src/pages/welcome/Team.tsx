import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button'

export const Team = () => {
	const navigate = useNavigate()
	const [step, setStep] = useState(1)
	const [selectedOption, setSelectedOption] = useState<string>('')
	const [selectedActivity, setSelectedActivity] = useState('Не выбрано')
	const [selectedRole, setSelectedRole] = useState('Не выбрано')
	const [isLoading, setIsLoading] = useState(false)

	const activities = [
		'Дизайн',
		'Создание продукта',
		'Разработка ПО',
		'Управление бизнесом',
		'Мероприятия',
		'Преподаватель',
		'Юридические услуги',
		'Креативное производство'
	]

	const roles = [
		'Член команды',
		'Лидер команды',
		'Владелец бизнеса',
		'Директор/Топ-менеджер',
		'Фрилансер',
		'Учитель',
		'Студент'
	]

	const isButtonDisabled = () => {
		if (step === 1) return !selectedOption
		if (step === 2) return selectedActivity === 'Не выбрано'
		if (step === 3) return selectedRole === 'Не выбрано'
		return false
	}

	const handleContinue = async () => {
		if (isButtonDisabled()) return

		if (step === 3) {
			setIsLoading(true)
			try {
				const roleData = {
					teamSize: selectedOption,
					activity: selectedActivity,
					role: selectedRole
				}

				// Вывод данных в консоль
				console.log('Отправляемые данные для роли:', roleData)

				// Здесь будет отправка на бэк
				// await RoleService.addRole(roleData)

				navigate('/desk')
			} catch (error) {
				console.error('Ошибка:', error)
			} finally {
				setIsLoading(false)
			}
			return
		}
		setStep(prev => prev + 1)
	}

	const renderStep = () => {
		switch (step) {
			case 1:
				return (
					<div className='mb-6'>
						<h2 className='text-gray-900 font-medium mb-2 text-left'>Со сколькими людьми ты будешь работать?</h2>
						<div className='flex flex-wrap gap-3 mb-8'>
							{['Только я', '2-5', '6-10', '11-25', '26-50', '50-100', '100+'].map(option => (
								<button
									key={option}
									onClick={() => setSelectedOption(option)}
									className={`px-4 py-2 rounded-lg border ${
										selectedOption === option
											? 'border-blue-500 text-white bg-blue-500'
											: 'border-gray-200 text-gray-700 hover:border-gray-700'
									} transition-all duration-200`}>
									{option}
								</button>
							))}
						</div>
					</div>
				)
			case 2:
				return (
					<div className='mb-6'>
						<h2 className='text-gray-900 font-medium mb-2 text-left'>Чем ты или твоя команда занимаетесь?</h2>
						<div className='relative'>
							<select
								value={selectedActivity}
								onChange={e => setSelectedActivity(e.target.value)}
								className='w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 appearance-none cursor-pointer text-gray-700'>
								<option value='Не выбрано'>Не выбрано</option>
								{activities.map(activity => (
									<option key={activity} value={activity}>
										{activity}
									</option>
								))}
							</select>
							<div className='absolute right-4 top-1/2 transform -translate-y-1/2'>
								<svg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'>
									<path d='M1 1L6 6L11 1' stroke='#6B7280' strokeWidth='2' strokeLinecap='round' />
								</svg>
							</div>
						</div>
					</div>
				)
			case 3:
				return (
					<div className='mb-6'>
						<h2 className='text-gray-900 font-medium mb-2 text-left'>Какая у тебя роль?</h2>
						<div className='relative'>
							<select
								value={selectedRole}
								onChange={e => setSelectedRole(e.target.value)}
								className='w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 appearance-none cursor-pointer text-gray-700'>
								<option value='Не выбрано'>Не выбрано</option>
								{roles.map(role => (
									<option key={role} value={role}>
										{role}
									</option>
								))}
							</select>
							<div className='absolute right-4 top-1/2 transform -translate-y-1/2'>
								<svg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'>
									<path d='M1 1L6 6L11 1' stroke='#6B7280' strokeWidth='2' strokeLinecap='round' />
								</svg>
							</div>
						</div>
					</div>
				)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center font-["Inter",sans-serif] -mt-36'>
			<div className='max-w-xl mx-auto w-[450px]'>
				<h1 className='text-[36px] font-semibold text-gray-900 mb-8 text-left'>
					Расскажи о <span className='text-[#6B7BF7]'>себе</span>
				</h1>

				<div className='flex gap-2 mb-8'>
					<div className='h-1 rounded-full bg-[#6B7BF7] flex-1'></div>
					<div className={`h-1 rounded-full ${step >= 2 ? 'bg-[#6B7BF7]' : 'bg-gray-200'} flex-1`}></div>
					<div className={`h-1 rounded-full ${step >= 3 ? 'bg-[#6B7BF7]' : 'bg-gray-200'} flex-1`}></div>
				</div>

				<p className='text-gray-500 text-sm mb-8 text-left'>Эти ответы помогут делать WEEEK лучше</p>

				{renderStep()}

				<div className='flex justify-center w-full'>
					<Button
						onClick={handleContinue}
						disabled={isButtonDisabled() || isLoading}
						className={`w-full h-12 p-0 flex items-center justify-center rounded-xl transition-all duration-200 ${
							isButtonDisabled() || isLoading
								? 'bg-gray-200 text-[#A1A5B7] cursor-not-allowed pointer-events-none border-gray-100 hover:bg-gray-200'
								: 'bg-[linear-gradient(135deg,#c2d8fd_0%,#6c78f4_50%,#c2d8fd_100%)] hover:opacity-90 shadow-[0_2px_12px_rgba(107,138,253,0.35)] text-white'
						}`}>
						{isLoading ? 'Сохранение...' : 'Продолжить'}
					</Button>
				</div>
			</div>
		</div>
	)
}

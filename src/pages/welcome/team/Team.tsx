import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { ProgressBar } from './components/ProgressBar'
import { TeamStepOne } from './components/TeamStepOne'
import { TeamStepThree } from './components/TeamStepThree'
import { TeamStepTwo } from './components/TeamStepTwo'
import { Activity, Role, TeamData, TeamSize } from './types/team.types'
import { isStepComplete, saveTeamData } from './utils/teamHelpers'

export const Team = () => {
	const navigate = useNavigate()
	const [step, setStep] = useState(1)
	const [selectedOption, setSelectedOption] = useState<TeamSize>('')
	const [selectedActivity, setSelectedActivity] = useState<Activity>('Не выбрано')
	const [selectedRole, setSelectedRole] = useState<Role>('Не выбрано')
	const [isLoading, setIsLoading] = useState(false)

	const activities = ['Дизайн', 'Создание продукта', 'Разработка ПО', 'Управление бизнесом', 'Мероприятия', 'Преподаватель', 'Юридические услуги', 'Креативное производство']

	const roles = ['Член команды', 'Лидер команды', 'Владелец бизнеса', 'Директор/Топ-менеджер', 'Фрилансер', 'Учитель', 'Студент']

	const teamData: TeamData = {
		teamSize: selectedOption,
		activity: selectedActivity,
		role: selectedRole
	}

	const isButtonDisabled = !isStepComplete(step, teamData) || isLoading

	const handleContinue = async () => {
		if (isButtonDisabled) return

		if (step === 3) {
			setIsLoading(true)
			try {
				await saveTeamData(teamData)
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
				return <TeamStepOne selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
			case 2:
				return <TeamStepTwo selectedActivity={selectedActivity} setSelectedActivity={setSelectedActivity} activities={activities} />
			case 3:
				return <TeamStepThree selectedRole={selectedRole} setSelectedRole={setSelectedRole} roles={roles} />
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center font-["Inter",sans-serif] -mt-36'>
			<div className='max-w-xl mx-auto w-[450px]'>
				<h1 className='text-[36px] font-semibold text-gray-900 mb-8 text-left'>
					Расскажи о <span className='text-[#6B7BF7]'>себе</span>
				</h1>

				<ProgressBar step={step} />

				<p className='text-gray-500 text-sm mb-8 text-left'>Эти ответы помогут делать WEEEK лучше</p>

				{renderStep()}

				<div className='flex justify-center w-full'>
					<Button
						onClick={handleContinue}
						disabled={isButtonDisabled}
						className={`w-full h-12 p-0 flex items-center justify-center rounded-xl transition-all duration-200 ${
							isButtonDisabled
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

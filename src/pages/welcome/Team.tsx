import {useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button'

export const Team = () => {
	const navigate = useNavigate()

	return (
		<div className='min-h-screen flex items-center justify-center  font-["Inter",sans-serif] -mt-36'>
			<div className='max-w-xl mx-auto w-[450px]'>
				<h1 className='text-[36px] font-semibold text-gray-900 mb-8 text-left'>
					Расскажи о <span className='text-[#6B7BF7]'>себе</span>
				</h1>

				{/* Индикатор прогресса */}
				<div className='flex gap-2 mb-8'>
					<div className='h-1 rounded-full bg-[#6B7BF7] flex-1'></div>
					<div className='h-1 rounded-full bg-gray-200 flex-1'></div>
					<div className='h-1 rounded-full bg-gray-200 flex-1'></div>
				</div>

				<p className='text-gray-500 text-sm mb-8 text-left'>Эти ответы помогут делать TASKI.PRO лучше</p>

				<div className='mb-6'>
					<h2 className='text-gray-900 font-medium mb-2 text-left'>Со сколькими людьми ты будешь работать?</h2>
					<div className='flex flex-wrap gap-3 mb-8'>
						{['Только я', '2-5', '6-10', '11-25', '26-50', '50-100', '100+'].map(option => (
							<button
								key={option}
								className='px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-700  focus:border-blue-500 focus:text-white focus:bg-blue-500 transition-all duration-200 '>
								{option}
							</button>
						))}
					</div>
				</div>

				<div className='flex justify-center w-full'>
					<Button className='w-full h-12 text-white p-0 flex items-center justify-center bg-[linear-gradient(135deg,#c2d8fd_0%,#6c78f4_50%,#c2d8fd_100%)] hover:opacity-90 shadow-[0_2px_12px_rgba(107,138,253,0.35)] rounded-xl'>
						Продолжить
					</Button>
				</div>
			</div>
		</div>
	)
}

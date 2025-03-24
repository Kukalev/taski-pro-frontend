import { TeamStepOneProps } from '../types/team.types'

export const TeamStepOne = ({ selectedOption, setSelectedOption }: TeamStepOneProps) => {
	const options = ['Только я', '2-5', '6-10', '11-25', '26-50', '50-100', '100+']

	return (
		<div className='mb-6'>
			<h2 className='text-gray-900 font-medium mb-2 text-left'>Со сколькими людьми ты будешь работать?</h2>
			<div className='flex flex-wrap gap-3 mb-8'>
				{options.map(option => (
					<button
						key={option}
						onClick={() => setSelectedOption(option)}
						className={`px-4 py-2 rounded-lg border ${selectedOption === option ? 'border-blue-500 text-white bg-blue-500' : 'border-gray-200 text-gray-700 hover:border-gray-700'} transition-all duration-200`}>
						{option}
					</button>
				))}
			</div>
		</div>
	)
}

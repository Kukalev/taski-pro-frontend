import { ProgressBarProps } from '../types/team.types'

export const ProgressBar = ({ step }: ProgressBarProps) => {
	return (
		<div className='flex gap-2 mb-8'>
			<div className='h-1 rounded-full bg-[#6B7BF7] flex-1'></div>
			<div className={`h-1 rounded-full ${step >= 2 ? 'bg-[#6B7BF7]' : 'bg-gray-200'} flex-1`}></div>
			<div className={`h-1 rounded-full ${step >= 3 ? 'bg-[#6B7BF7]' : 'bg-gray-200'} flex-1`}></div>
		</div>
	)
}

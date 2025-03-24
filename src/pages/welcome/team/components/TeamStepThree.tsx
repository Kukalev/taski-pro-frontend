import { TeamStepThreeProps } from '../types/team.types'

export const TeamStepThree = ({ selectedRole, setSelectedRole, roles }: TeamStepThreeProps) => {
	return (
		<div className='mb-6'>
			<h2 className='text-gray-900 font-medium mb-2 text-left'>Какая у тебя роль?</h2>
			<div className='relative'>
				<select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className='w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 appearance-none cursor-pointer text-gray-700'>
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

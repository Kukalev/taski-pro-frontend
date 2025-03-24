export const HeaderLogo = () => {
	return (
		<div className='flex items-center'>
			<div className='flex items-center mr-4'>
				<div className='w-7 h-7 bg-gradient-to-r from-blue-400 to-purple-400 rounded flex items-center justify-center mr-2'>
					<div className='grid grid-cols-2 gap-0.5'>
						<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
						<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
						<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
						<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
					</div>
				</div>
			</div>

			<div className='flex items-center bg-gray-100 rounded-lg py-1 px-2'>
				<div className='w-5 h-5 bg-indigo-100 text-indigo-500 rounded flex items-center justify-center mr-2'>
					<svg className='w-3 h-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
						<path d='M5 13l4 4L19 7' />
					</svg>
				</div>
				<span className='font-medium text-gray-800'>Задачи</span>
			</div>
		</div>
	)
}

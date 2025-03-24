import { SidebarSearchProps } from '../types/sidebar.types'

export const SidebarSearch = ({ placeholder = 'Поиск' }: SidebarSearchProps) => {
	return (
		<div className='mb-4'>
			<div className='relative'>
				<input type='text' placeholder={placeholder} className='w-full px-4 py-2 pl-10 bg-gray-100 border border-white rounded-2xl hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-all duration-200' />
				<div className='absolute left-3 top-1/2 -translate-y-1/2'>
					<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-gray-400'>
						<path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
					</svg>
				</div>
			</div>
		</div>
	)
}

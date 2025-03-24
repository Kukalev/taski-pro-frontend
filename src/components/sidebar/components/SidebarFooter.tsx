import { SidebarFooterProps } from '../types/sidebar.types'

export const SidebarFooter = ({ desksCount }: SidebarFooterProps) => {
	return (
		<div className='text-sm text-gray-500'>
			Создано {desksCount} из 7 досок
			<div className='mt-2 h-1 bg-gray-200 rounded-full'>
				<div className='h-full bg-[#FF9500] rounded-full' style={{ width: `${Math.min((desksCount / 7) * 100, 100)}%` }}></div>
			</div>
		</div>
	)
}

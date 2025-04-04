import {HeaderIconsProps} from '../types/header.types'
import {IconButton} from './IconButton'

export const HeaderIcons = ({}: HeaderIconsProps) => {
	return (
		<div className='flex items-center space-x-2 mr-2'>
			<IconButton
				icon={
					<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13 21v-2h-2v2' />
					</svg>
				}
			/>

			<IconButton
				icon={
					<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
					</svg>
				}
			/>

			<IconButton
				icon={
					<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<circle cx='12' cy='12' r='10' />
						<path d='M12 16v-4M12 8h.01' />
					</svg>
				}
			/>

			<IconButton
				icon={
					<svg className='w-5 h-5 ' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<circle cx='11' cy='11' r='8' />
						<path d='M21 21l-4.3-4.3' />
					</svg>
				}
			/>
		</div>
	)
}

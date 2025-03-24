import { DeskData } from '../types/desk.types'
import { getDeskColor } from '../../../../utils/deskColors'

interface DeskRowProps {
	desk: DeskData
	username: string
}

export const DeskRow = ({ desk, username }: DeskRowProps) => (
	<tr className='border-b border-gray-100 hover:bg-gray-50 cursor-pointer' onClick={() => (window.location.href = `/desk/${desk.id}`)}>
		<td className='py-3 px-4'>
			<div className='flex items-center'>
				<div className={`w-8 h-8 ${getDeskColor(desk.id)} rounded flex items-center justify-center mr-3`}>{desk.deskName.charAt(0).toUpperCase()}</div>
				<span className='font-medium text-gray-800'>{desk.deskName}</span>
			</div>
		</td>
		<td className='py-3 px-4'>
			<div className='flex items-center'>
				<div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
				<span className='text-gray-700'>В работе</span>
			</div>
		</td>
		<td className='py-3 px-4 text-gray-700'>-</td>
		<td className='py-3 px-4'>
			<div className='flex items-center'>
				<span className='text-xs mr-1 bg-gray-200 text-gray-600 rounded px-1'>AA</span>
				<span className='text-gray-700'>{username}</span>
			</div>
		</td>
	</tr>
)

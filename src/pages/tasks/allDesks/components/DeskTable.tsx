import { DeskData } from '../types/desk.types'
import { TableBody } from './TableBody'
import { TableHeader } from './TableHeader'

interface DeskTableProps {
	desks: DeskData[]
	loading: boolean
	username: string
}

export const DeskTable = ({ desks, loading, username }: DeskTableProps) => {
	return (
		<div className='w-full bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden'>
			<div className='overflow-auto h-full'>
				<table className='w-full table-fixed'>
					<TableHeader />
					<TableBody desks={desks} loading={loading} username={username} />
				</table>
			</div>
		</div>
	)
}

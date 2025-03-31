import {DeskData} from '../types/desk.types'
import {TableBody} from './TableBody'
import {TableHeader} from './TableHeader'

interface DeskTableProps {
	desks: DeskData[]
	loading: boolean
	username: string
	onRename?: (id: number) => void
	onDelete?: (id: number) => void
}

export const DeskTable = ({ desks, loading, username, onRename, onDelete }: DeskTableProps) => {
	return (
		<div className='w-full bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden ml-2'>
			<div className='overflow-auto h-full'>
				<table className='w-full table-fixed'>
					<TableHeader />
					<TableBody desks={desks} loading={loading} username={username} onRename={onRename} onDelete={onDelete} />
				</table>
			</div>
		</div>
	)
}

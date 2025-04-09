import { DeskData } from '../../../../contexts/DeskContext'
import {TableBody} from './TableBody'
import {TableHeader} from './TableHeader'

interface DeskTableProps {
	desks: DeskData[]
	loading: boolean
	onRename?: (deskId: number, initialName: string, initialDescription: string) => void
	onDelete?: (deskId: number, deskName: string) => void
    avatarsMap: Record<string, string | null>;
}

export const DeskTable = ({ desks, loading, onRename, onDelete, avatarsMap }: DeskTableProps) => {
	return (
		<div className='w-full bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden ml-2'>
			<div className='overflow-auto h-full'>
				<table className='w-full table-fixed'>
					<TableHeader />
					<TableBody desks={desks} loading={loading} onRename={onRename} onDelete={onDelete} avatarsMap={avatarsMap} />
				</table>
			</div>
		</div>
	)
}

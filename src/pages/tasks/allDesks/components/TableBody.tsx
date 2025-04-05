import { DeskData } from '../../../../contexts/DeskContext'
import { DeskRow } from './DeskRow'

interface TableBodyProps {
	desks: DeskData[]
	loading: boolean
	onRename?: (deskId: number, initialName: string, initialDescription: string) => void
	onDelete?: (deskId: number, deskName: string) => void
}

export const TableBody = ({ desks, loading, onRename, onDelete }: TableBodyProps) => {
	if (loading) {
		return (
			<tbody>
				<tr>
					<td colSpan={4} className='py-8 text-center text-gray-500'>
						Загрузка досок...
					</td>
				</tr>
			</tbody>
		)
	}

	if (desks.length === 0) {
		return (
			<tbody>
				<tr>
					<td colSpan={4} className='py-8 text-center text-gray-500'>
						Не найдено досок, соответствующих критериям поиска
					</td>
				</tr>
			</tbody>
		)
	}

	return (
		<tbody>
			{desks.map(desk => (
				<DeskRow key={desk.id} desk={desk} onRename={onRename} onDelete={onDelete} />
			))}
		</tbody>
	)
}

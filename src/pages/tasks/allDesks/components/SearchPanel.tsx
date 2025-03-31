import {SearchIcon} from './SearchIcon'

interface SearchPanelProps {
	searchQuery: string
	onSearchChange: (value: string) => void
	onAddDesk: () => void
}

export const SearchPanel = ({ searchQuery, onSearchChange, onAddDesk }: SearchPanelProps) => {
	return (
		<div className='flex justify-between items-center  mb-4 ml-2 w-full'>
			<div className='w-[250px]'>
				<div className='relative w-full'>
					<input type='text' placeholder='Поиск' value={searchQuery} onChange={e => onSearchChange(e.target.value)} className='w-full px-3 py-2 pl-9 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300' />
					<SearchIcon />
				</div>
			</div>

			<button onClick={onAddDesk} className='bg-orange-500 text-white px-4 py-2 m-5 rounded-lg hover:bg-orange-600 transition-colors'>
				Добавить доску
			</button>
		</div>
	)
}

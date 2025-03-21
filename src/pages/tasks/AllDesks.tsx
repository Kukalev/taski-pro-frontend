import {useState} from 'react'
import {CreateDeskModal} from '../../components/modals/CreateDeskModal'

interface Desk {
	id: number
	name: string
	status: string
	date: string
	owner: string
}

export const AllDesks = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')

	// Пример данных досок
	const [desks, setDesks] = useState<Desk[]>([
		{
			id: 1,
			name: 'Проект',
			status: 'В работе',
			date: '-',
			owner: 'ASdasd a.'
		}
	])

	// Фильтрация досок по поисковому запросу
	const filteredDesks = desks.filter(desk => desk.name.toLowerCase().includes(searchQuery.toLowerCase()))

	return (
		<div className='flex-1 p-8'>
			<div className='max-w-full mx-auto'>
				{/* Верхняя часть с заголовком */}
				<div className='mb-6'>
					<h1 className='text-2xl font-semibold text-gray-900'>Все доски</h1>
				</div>

				{/* Панель с поиском и кнопкой добавления */}
				<div className='flex justify-between items-center mb-4'>
					<div className='flex items-center'>
						<div className='relative mr-4'>
							<input
								type='text'
								placeholder='Поиск'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className='w-[200px] px-3 py-2 pl-9 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300'
							/>
							<div className='absolute left-3 top-1/2 -translate-y-1/2'>
								<svg
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									className='text-gray-400'>
									<path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
								</svg>
							</div>
						</div>
					</div>

					<div>
						<button
							onClick={() => setIsModalOpen(true)}
							className='bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors'>
							Добавить доску
						</button>
					</div>
				</div>

				{/* Таблица с досками */}
				<div className='bg-white rounded-lg shadow-sm border border-gray-200'>
					{/* Заголовки таблицы */}
					<div className='grid grid-cols-4 border-b border-gray-200 py-3 px-4 bg-gray-50 text-sm font-medium text-gray-700'>
						<div>Наименование</div>
						<div>Статус</div>
						<div>Дата</div>
						<div>Владелец</div>
					</div>

					{/* Строки таблицы */}
					{filteredDesks.length > 0 ? (
						filteredDesks.map(desk => (
							<div
								key={desk.id}
								className='grid grid-cols-4 py-3 px-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer'>
								<div className='flex items-center'>
									<div className='w-8 h-8 bg-orange-100 text-orange-500 rounded flex items-center justify-center mr-3'>
										Д
									</div>
									<span className='font-medium text-gray-800'>{desk.name}</span>
								</div>
								<div className='flex items-center'>
									<div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
									<span className='text-gray-700'>{desk.status}</span>
								</div>
								<div className='text-gray-700'>{desk.date}</div>
								<div className='text-gray-700'>{desk.owner}</div>
							</div>
						))
					) : (
						<div className='py-8 text-center text-gray-500'>Не найдено досок, соответствующих критериям поиска</div>
					)}
				</div>
			</div>

			{/* Модальное окно для создания доски */}
			<CreateDeskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</div>
	)
}

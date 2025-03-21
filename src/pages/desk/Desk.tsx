import {useState} from 'react'

interface Board {
	id: string
	name: string
	description?: string
}

export const Desk = () => {
	const [boards, setBoards] = useState<Board[]>([])

	return (
		<div className='flex min-h-screen bg-white'>
			{/* Основной контент */}
			<div className='flex-1 p-8'>
				<div className='max-w-7xl mx-auto'>
					{/* Заголовок и кнопка создания */}
					<div className='flex justify-between items-center mb-8'>
						<h1 className='text-2xl font-semibold text-gray-900'>Мои доски</h1>
						<button
							className='px-4 py-2 bg-[#FF9500] text-white rounded-lg hover:opacity-90 transition-opacity'
							onClick={() => console.log('Создать новую доску')}>
							<div className='flex items-center gap-2'>
								<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M12 4v16m8-8H4' />
								</svg>
								<span>Создать доску</span>
							</div>
						</button>
					</div>

					{/* Сетка досок */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{boards.map(board => (
							<div
								key={board.id}
								className='bg-white h-48 rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer'>
								<h3 className='text-lg font-medium text-gray-900 mb-2'>{board.name}</h3>
								{board.description && <p className='text-gray-600 text-sm mb-4 line-clamp-2'>{board.description}</p>}
							</div>
						))}
					</div>

					{/* Пустое состояние */}
					{boards.length === 0 && (
						<div className='text-center mt-8'>
							<p className='text-gray-600'>У вас пока нет досок. Создайте свою первую доску!</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

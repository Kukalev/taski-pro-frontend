import { useNavigate } from 'react-router-dom'

export const NotFound = () => {
	const navigate = useNavigate()

	return (
		<div className='flex flex-col items-center justify-center p-8 min-h-[50vh]'>
			<h1 className='text-4xl font-bold text-red-500 mb-4'>404</h1>
			<h2 className='text-2xl font-semibold mb-6'>Страница не найдена</h2>
			<p className='text-gray-600 mb-8'>Запрашиваемая страница не существует или была удалена.</p>
			<button onClick={() => navigate('/desk')} className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
				Вернуться на главную
			</button>
		</div>
	)
}

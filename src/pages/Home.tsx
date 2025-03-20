export const Home = () => {
	return (
		<div className='min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4'>
			<div className='text-center max-w-2xl mx-auto'>
				<h1 className='text-3xl font-bold text-gray-800 mb-6'>Добро пожаловать в личный кабинет!</h1>
				<p className='text-gray-600 mb-8'>Вы успешно вошли в систему. Здесь будет ваш личный кабинет.</p>
				<div className='bg-white p-6 rounded-lg shadow-md'>
					<p className='text-gray-800 font-medium'>Скоро здесь появится больше функций.</p>
				</div>
			</div>
		</div>
	)
}

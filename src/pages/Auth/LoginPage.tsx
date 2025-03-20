import {useState} from 'react'
import {IoMailOutline} from 'react-icons/io5'
import {SlLock} from 'react-icons/sl'
import {Link, useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button'
import {Input} from '../../components/ui/Input'
import authAPI from '../../services/api'

export const LoginPage = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	})

	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)

		try {
			// Формируем данные для отправки согласно API бэкенда
			const requestData = {
				username: formData.email, // Используем email как username
				password: formData.password
			}

			// Используем наш API для входа
			const response = await authAPI.login(requestData)

			// Обрабатываем успешный ответ
			console.log('Успешный вход:', response)

			// После успешного входа перенаправляем на главную страницу
			navigate('/home')
		} catch (err: any) {
			// Обрабатываем ошибку
			setError(err.message || 'Неверное имя пользователя или пароль')
			console.error('Ошибка:', err)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 px-4 '>
			<div className='w-full max-w-[350px] -mt-64'>
				<div className='text-left mb-2.5 flex justify-between px-2'>
					<h1 className='text-[19px] font-semibold text-[#4d505e]'>Вход</h1>
					<Link
						to='/forgot-password'
						className='text-[15px] font-medium   text-gray-400 decoration-gray-300  underline decoration-[1.5px] underline-offset-[3.5px] decoration-text-gray-400 hover:text-[#4d505e] transition-all duration-200
						  hover:decoration-[#4d505e] '>
						Забыли пароль?
					</Link>
				</div>

				<form onSubmit={handleSubmit} className='bg-gray-100 rounded-xl p-5 shadow-sm '>
					{/* Показываем сообщение об ошибке */}
					{error && <div className='mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm'>{error}</div>}
					<div className='space-y-4'>
						<Input
							type='email'
							placeholder='Электронная почта'
							value={formData.email}
							onChange={e => setFormData({...formData, email: e.target.value})}
							icon={<IoMailOutline />}
						/>
						<Input
							type='password'
							placeholder='Пароль'
							value={formData.password}
							onChange={e => setFormData({...formData, password: e.target.value})}
							icon={<SlLock />}
						/>
					</div>

					<div className='mt-5'>
						<Button type='submit' fullWidth>
							Войти
						</Button>
					</div>
				</form>

				<p className='text-center text-xm text-gray-500 mt-4'>У вас ещё нет аккаунта? </p>
				<Link
					to='/register'
					className='font-medium text-blue-300 underline underline-offset-[3.5px] decoration-[1.5px] decoration-blue-200 hover:text-blue-600 hover:decoration-blue-500 transition-all duration-200'>
					Зарегистрируйтесь бесплатно
				</Link>
			</div>
		</div>
	)
}

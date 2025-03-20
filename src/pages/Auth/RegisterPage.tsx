import { useState } from 'react'
import { IoMailOutline } from 'react-icons/io5'
import { PiSmiley } from 'react-icons/pi'
import { SlLock } from 'react-icons/sl'
import { WiStars } from 'react-icons/wi'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import authAPI from '../../services/api'

export const RegisterPage = () => {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: ''
	})

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Формируем данные для отправки согласно API бэкенда
      const requestData = {
        username: formData.email, // Используем email как username
        email: formData.email,
        password: formData.password,
        firstname: formData.firstName,
        lastname: formData.lastName
      }

      // Используем наш API для регистрации
      const response = await authAPI.register(requestData);
      
      // Обрабатываем успешный ответ
      setSuccess('Регистрация прошла успешно!');
      console.log('Ответ от сервера:', response);
      
      // Очищаем форму
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
    } catch (err: any) {
      // Обрабатываем ошибку
      setError(err.message || 'Произошла ошибка при регистрации');
      console.error('Ошибка:', err);
    } finally {
      setIsLoading(false);
    }
	}

  

	return (
		<div className='min-h-screen flex items-center justify-center  px-4 '>
			<div className='w-full max-w-[350px] -mt-64'>
				<div className='text-left mb-0.5 flex justify-between px-2'>
					<h1 className='text-[19px] font-semibold   text-[#4d505e]'>Создайте аккаунт</h1>
					<WiStars className='text-[38px] text-gray-300 ' />
				</div>

				<form onSubmit={handleSubmit} className='bg-gray-100 rounded-xl p-5 shadow-sm '>

					{success && (
						<div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md text-sm">
							{success}
						</div>
					)}
          
					{/* Показываем сообщение об ошибке */}
					{error && (
						<div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
							{error}
						</div>
					)}

					<div className='grid grid-cols-2 gap-4 mb-4'>
						<Input
							placeholder='Имя'
							value={formData.firstName}
							onChange={e => setFormData({...formData, firstName: e.target.value})}
							icon={<PiSmiley />}
						/>
						<Input
							placeholder='Фамилия'
							value={formData.lastName}
							onChange={e => setFormData({...formData, lastName: e.target.value})}
						/>
					</div>

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
							Создать аккаунт
						</Button>
					</div>
				</form>
				<p className='text-center text-xm text-gray-500 mt-4'>
					Уже зарегистрированы?{' '}
					<Link
						to='/login'
						className='font-medium text-blue-300 underline underline-offset-[3.5px] decoration-[1.5px] decoration-blue-200 hover:text-blue-600 hover:decoration-blue-500  transition-all duration-200'>
						Войти в аккаунт
					</Link>
				</p>
			</div>
		</div>
	)
}

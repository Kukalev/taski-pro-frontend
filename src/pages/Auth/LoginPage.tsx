import {useEffect, useState} from 'react'
import {IoMailOutline} from 'react-icons/io5'
import {MdOutlineInfo} from 'react-icons/md'
import {SlLock} from 'react-icons/sl'
import {Link, useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button'
import {Input} from '../../components/ui/Input'
import {login} from '../../services/auth/login'
import {ApiError, LoginFormData} from '../../types/auth.types'

export const LoginPage = () => {
	const navigate = useNavigate()

	const [formData, setFormData] = useState<LoginFormData>({
		email: '',
		password: ''
	})

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [validationError, setValidationError] = useState<string | null>(null)
	const [authError, setAuthError] = useState<string | null>(null)
	const [isErrorVisible, setIsErrorVisible] = useState<boolean>(false)
	const [fieldErrors, setFieldErrors] = useState({
		email: false,
		password: false
	})

	// Эффект для плавного появления ошибки
	useEffect(() => {
		if (validationError || authError) {
			setTimeout(() => setIsErrorVisible(true), 50)
		} else {
			setIsErrorVisible(false)
		}
	}, [validationError, authError])

	// Валидация формы
	const validateForm = (): boolean => {
		const errors = {
			email: !formData.email.trim(),
			password: !formData.password.trim()
		}

		setFieldErrors(errors)

		if (errors.email || errors.password) {
			setValidationError('Необходимо заполнить все подсвеченные поля')
			return false
		}

		return true
	}

	// Обработчики изменения полей
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData({...formData, email: value})

		// Сбрасываем ошибку поля
		if (value.trim()) {
			setFieldErrors({...fieldErrors, email: false})
		}

		// Если исправляется ошибка, сбрасываем сообщения об ошибке
		if (validationError && fieldErrors.email) {
			// Проверяем, осталось ли другое поле с ошибкой
			if (!fieldErrors.password || formData.password.trim()) {
				setValidationError(null)
			}
		}

		// Сбрасываем ошибку аутентификации при любом изменении
		if (authError) {
			setAuthError(null)
		}
	}

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData({...formData, password: value})

		// Сбрасываем ошибку поля
		if (value.trim()) {
			setFieldErrors({...fieldErrors, password: false})
		}

		// Если исправляется ошибка, сбрасываем сообщения об ошибке
		if (validationError && fieldErrors.password) {
			// Проверяем, осталось ли другое поле с ошибкой
			if (!fieldErrors.email || formData.email.trim()) {
				setValidationError(null)
			}
		}

		// Сбрасываем ошибку аутентификации при любом изменении
		if (authError) {
			setAuthError(null)
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		// Проверяем валидность формы
		const isValid = validateForm()

		// Если форма невалидна, просто обновляем анимацию и выходим
		if (!isValid) {
			// Эти строки для обновления анимации (мигание)
			setIsErrorVisible(false)
			setTimeout(() => setIsErrorVisible(true), 50)
			return
		}

		// Очищаем все предыдущие ошибки, только если форма валидна
		setValidationError(null)
		setAuthError(null)
		setIsErrorVisible(false)
		setIsLoading(true)

		try {
			// Формируем данные для отправки согласно API бэкенда
			const requestData = {
				username: formData.email,
				password: formData.password
			}

			// Используем функцию login напрямую
			const response = await login(requestData)

			// После успешного входа перенаправляем на главную страницу
			navigate('/welcome')
		} catch (err: any) {
			const apiError = err as ApiError
			setAuthError(apiError.message || 'Неверное имя пользователя или пароль')
			// Активируем анимацию
			setIsErrorVisible(true)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center px-4'>
			<div className='w-full max-w-[350px] -mt-64'>
				<div className='text-left mb-2.5 flex justify-between px-2'>
					<h1 className='text-[19px] font-semibold text-[#4d505e]'>Вход</h1>
					<Link
						to='/forgot-password'
						className='text-[15px] font-medium text-gray-400 decoration-gray-300 underline decoration-[1.5px] underline-offset-[3.5px] decoration-text-gray-400 hover:text-[#4d505e] transition-all duration-200 hover:decoration-[#4d505e]'>
						Забыли пароль?
					</Link>
				</div>

				<form onSubmit={handleSubmit} className='bg-gray-100 rounded-xl p-5 shadow-sm'>
					<div className='space-y-4'>
						<Input
							type='email'
							placeholder='Электронная почта'
							value={formData.email}
							onChange={handleEmailChange}
							icon={<IoMailOutline />}
							error={fieldErrors.email}
						/>
						<Input
							type='password'
							placeholder='Пароль'
							value={formData.password}
							onChange={handlePasswordChange}
							icon={<SlLock />}
							error={fieldErrors.password}
						/>
					</div>

					{validationError && (
						<div
							className={`mt-3 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${
								isErrorVisible ? 'opacity-100' : 'opacity-0'
							}`}>
							<MdOutlineInfo className='text-xl flex-shrink-0 mt-2.5' />
							<p className='text-sm text-left'>
								Необходимо заполнить все подсвеченные
								<br />
								поля
							</p>
						</div>
					)}

					{/* Сообщение об ошибке аутентификации */}
					{authError && (
						<div
							className={`mt-3.5 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${
								isErrorVisible ? 'opacity-100' : 'opacity-0'
							}`}>
							<MdOutlineInfo className='text-xl flex-shrink-0 mt-0' />
							<p className='text-sm text-left'>{authError}</p>
						</div>
					)}

					<div className='mt-3'>
						<Button type='submit' fullWidth disabled={isLoading}>
							{isLoading ? 'Вход...' : 'Войти'}
						</Button>
					</div>
				</form>

				<p className='text-center text-xm text-gray-500 mt-4'>
					У вас ещё нет аккаунта?{' '}
					<Link
						to='/register'
						className='font-medium text-blue-300 underline underline-offset-[3.5px] decoration-[1.5px] decoration-blue-200 hover:text-blue-600 hover:decoration-blue-500 transition-all duration-200'>
						Зарегистрируйтесь бесплатно
					</Link>
				</p>
			</div>
		</div>
	)
}

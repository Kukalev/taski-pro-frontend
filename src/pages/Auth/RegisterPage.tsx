import {FormEvent, useEffect, useState} from 'react'
import {IoMailOutline} from 'react-icons/io5'
import {MdOutlineInfo} from 'react-icons/md'
import {PiSmiley} from 'react-icons/pi'
import {SlLock} from 'react-icons/sl'
import {WiStars} from 'react-icons/wi'
import {CgProfile} from 'react-icons/cg'
import {Link, useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button'
import {Input} from '../../components/ui/Input'
import {AuthService} from '../../services/auth/Auth'
import {RegisterFormData, RegisterRequest} from '../../types/auth.types'
import { useAuth } from '../../contexts/AuthContext'

export const RegisterPage = () => {
	const navigate = useNavigate()
	const { login: authContextLogin } = useAuth()
	const [formData, setFormData] = useState<RegisterFormData>({
		firstName: '',
		lastName: '',
		username: '',
		email: '',
		password: ''
	})

	// Отслеживаем ошибки по каждому полю
	const [fieldErrors, setFieldErrors] = useState<Record<keyof RegisterFormData, boolean>>({
		firstName: false,
		lastName: false,
		username: false,
		email: false,
		password: false
	})

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [serverError, setServerError] = useState<string | null>(null)
	const [validationError, setValidationError] = useState<string | null>(null)
	const [isErrorVisible, setIsErrorVisible] = useState<boolean>(false)

	// Для конкретных сообщений об ошибках валидации
	const [errorType, setErrorType] = useState<'empty' | 'format' | 'server' | null>(null)

	// Эффект для плавного появления ошибки
	useEffect(() => {
		if (validationError || serverError) {
			setTimeout(() => setIsErrorVisible(true), 50)
		} else {
			setIsErrorVisible(false)
		}
	}, [validationError, serverError])

	// Простые функции валидации
	const checkEmail = (email: string) => {
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return re.test(email);
	}
	
	const checkPassword = (password: string) => {
		return password.length >= 6;
	}
	
	const checkName = (name: string) => {
		return /^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(name);
	}

	// Валидация формы с детальными ошибками
	const validateForm = (): boolean => {
		const errors: Record<keyof RegisterFormData, boolean> = {
			firstName: false,
			lastName: false,
			username: false,
			email: false,
			password: false
		}

		let hasErrors = false

		// Проверка на пустые поля
		for (const field in formData) {
			const key = field as keyof RegisterFormData
			if (!formData[key].trim()) {
				errors[key] = true
				hasErrors = true
			}
		}

		// Если есть пустые поля, показываем общую ошибку
		if (hasErrors) {
			setFieldErrors(errors)
			setValidationError('Необходимо заполнить все подсвеченные поля')
			setErrorType('empty')
			return false
		}

		// Проверка формата полей, если все заполнены
		if (!checkEmail(formData.email)) {
			errors.email = true
			setFieldErrors(errors)
			setValidationError('Неверный формат электронной почты')
			setErrorType('format')
			return false
		}

		if (!checkPassword(formData.password)) {
			errors.password = true
			setFieldErrors(errors)
			setValidationError('Пароль должен быть не менее 6 символов')
			setErrorType('format')
			return false
		}

		if (!checkName(formData.firstName)) {
			errors.firstName = true
			setFieldErrors(errors)
			setValidationError('Имя содержит недопустимые символы')
			setErrorType('format')
			return false
		}

		if (!checkName(formData.lastName)) {
			errors.lastName = true
			setFieldErrors(errors)
			setValidationError('Фамилия содержит недопустимые символы')
			setErrorType('format')
			return false
		}

		// Если все в порядке
		setFieldErrors(errors)
		setValidationError(null)
		setErrorType(null)
		return true
	}

	// Обработчики изменения полей
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData({ ...formData, email: value })

		// Проверка и сброс ошибок
		if (fieldErrors.email) {
			// При вводе правильного email сбрасываем ошибку
			if (checkEmail(value)) {
				setFieldErrors({ ...fieldErrors, email: false })

				// Если это была единственная ошибка формата, сбрасываем сообщение
				if (errorType === 'format' && validationError === 'Неверный формат электронной почты') {
					setValidationError(null)
				}
			}
		}

		// Сбрасываем серверную ошибку при любом изменении
		if (serverError) {
			setServerError(null)
		}
	}

	// Обработчик для нового поля username
	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData({ ...formData, username: value })
		
		// Сбрасываем серверную ошибку при любом изменении
		if (serverError) {
			setServerError(null)
		}
		
		// Сбрасываем ошибку поля
		if (fieldErrors.username && value.trim()) {
			setFieldErrors({ ...fieldErrors, username: false })
		}
	}

	// Аналогичные обработчики для других полей
	const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData({ ...formData, firstName: value })

		if (fieldErrors.firstName) {
			if (checkName(value)) {
				setFieldErrors({ ...fieldErrors, firstName: false })

				if (errorType === 'format' && validationError === 'Имя содержит недопустимые символы') {
					setValidationError(null)
				}
			}
		}

		if (serverError) {
			setServerError(null)
		}
	}

	const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData({ ...formData, lastName: value })

		if (fieldErrors.lastName) {
			if (checkName(value)) {
				setFieldErrors({ ...fieldErrors, lastName: false })

				if (errorType === 'format' && validationError === 'Фамилия содержит недопустимые символы') {
					setValidationError(null)
				}
			}
		}

		if (serverError) {
			setServerError(null)
		}
	}

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFormData({ ...formData, password: value })

		if (fieldErrors.password) {
			if (checkPassword(value)) {
				setFieldErrors({ ...fieldErrors, password: false })

				if (errorType === 'format' && validationError === 'Пароль должен быть не менее 6 символов') {
					setValidationError(null)
				}
			}
		}

		if (serverError) {
			setServerError(null)
		}
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		// Проверяем валидность формы
		const isValid = validateForm()

		if (!isValid) {
			// Обновляем анимацию для повторного появления сообщения
			setIsErrorVisible(false)
			setTimeout(() => setIsErrorVisible(true), 50)
			return
		}

		// Если форма валидна
		setValidationError(null)
		setServerError(null)
		setIsErrorVisible(false)
		setIsLoading(true)

		try {
			// Формируем данные для отправки
			const requestData: RegisterRequest = {
				username: formData.username,
				email: formData.email,
				password: formData.password,
				firstName: formData.firstName,
				lastName: formData.lastName
			}
			console.log(requestData, 'REGISTATION')

			// Используем функцию register и передаем authContextLogin
			const response = await AuthService.register(requestData, authContextLogin)
			console.log(response)

			// Перенаправляем после успешной регистрации
			navigate('/welcome')
		} catch (err: any) {
			// Показываем ошибку с сервера
			const errorMessage = err.response?.data?.message || err.message || 'Произошла ошибка при регистрации.'
			setServerError(errorMessage)
			setErrorType('server')
			setIsErrorVisible(true)
			console.error('[RegisterPage] Ошибка регистрации:', err);
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center px-4'>
			<div className='w-full max-w-[350px] -mt-64'>
				<div className='text-left mb-0.5 flex justify-between px-2'>
					<h1 className='text-[19px] font-semibold text-[#4d505e]'>Создайте аккаунт</h1>
					<WiStars className='text-[38px] text-gray-300' />
				</div>

				<form onSubmit={handleSubmit} className='bg-gray-100 rounded-xl p-5 shadow-sm'>
					<div className='grid grid-cols-2 gap-4 mb-4'>
						<Input placeholder='Имя' value={formData.firstName} onChange={handleFirstNameChange} icon={<PiSmiley />} error={fieldErrors.firstName} />
						<Input placeholder='Фамилия' value={formData.lastName} onChange={handleLastNameChange} error={fieldErrors.lastName} />
					</div>

					<div className='space-y-4'>
						<Input placeholder='Имя пользователя' value={formData.username} onChange={handleUsernameChange} icon={<CgProfile />} error={fieldErrors.username} />
						<Input type='email' placeholder='Электронная почта' value={formData.email} onChange={handleEmailChange} icon={<IoMailOutline />} error={fieldErrors.email} />
						<Input type='password' placeholder='Пароль' value={formData.password} onChange={handlePasswordChange} icon={<SlLock />} error={fieldErrors.password} />
					</div>

					{/* Сообщение об ошибке валидации или серверной ошибке */}
					{(validationError || serverError) && (
						<div className={`mt-3 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${isErrorVisible ? 'opacity-100' : 'opacity-0'}`}>
							<MdOutlineInfo className={`text-xl flex-shrink-0 ${errorType === 'empty' ? 'mt-2.5' : 'mt-0'}`} />
							<p className='text-sm text-left'>
								{errorType === 'empty' ? (
									<>
										Необходимо заполнить все подсвеченные
										<br />
										поля
									</>
								) : (
									validationError || serverError
								)}
							</p>
						</div>
					)}

					<div className='mt-3'>
						<Button type='submit' fullWidth disabled={isLoading}>
							{isLoading ? 'Регистрация...' : 'Создать аккаунт'}
						</Button>
					</div>
				</form>
				<p className='text-center text-xm text-gray-500 mt-4'>
					Уже зарегистрированы?{' '}
					<Link to='/login' className='font-medium text-blue-300 underline underline-offset-[3.5px] decoration-[1.5px] decoration-blue-200 hover:text-blue-600 hover:decoration-blue-500 transition-all duration-200'>
						Войти в аккаунт
					</Link>
				</p>
			</div>
		</div>
	)
}

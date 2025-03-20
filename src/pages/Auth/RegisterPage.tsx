import {FormEvent, useEffect, useState} from 'react'
import {IoMailOutline} from 'react-icons/io5'
import {MdOutlineInfo} from 'react-icons/md'
import {PiSmiley} from 'react-icons/pi'
import {SlLock} from 'react-icons/sl'
import {WiStars} from 'react-icons/wi'
import {Link, useNavigate} from 'react-router-dom'
import {Button} from '../../components/ui/Button'
import {Input} from '../../components/ui/Input'
import {register} from '../../services/auth/register'
import {RegisterFormData, RegisterRequest} from '../../types/auth.types'
import {isEmailValid, isNameValid, isPasswordValid, validateRegisterForm} from '../../utils/validation'

export const RegisterPage = () => {
	const navigate = useNavigate()
	const [formData, setFormData] = useState<RegisterFormData>({
		firstName: '',
		lastName: '',
		email: '',
		password: ''
	})

	// Отслеживаем ошибки по каждому полю
	const [fieldErrors, setFieldErrors] = useState<Record<keyof RegisterFormData, boolean>>({
		firstName: false,
		lastName: false,
		email: false,
		password: false
	})

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [validationError, setValidationError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [isErrorVisible, setIsErrorVisible] = useState<boolean>(false)

	// Эффект для плавного появления ошибки
	useEffect(() => {
		if (validationError) {
			setTimeout(() => setIsErrorVisible(true), 50)
		} else {
			setIsErrorVisible(false)
		}
	}, [validationError])

	// Валидация формы с использованием утилиты
	const validateForm = (): boolean => {
		const validationResult = validateRegisterForm(formData)
		setFieldErrors(validationResult.fieldErrors)
		setValidationError(validationResult.message)
		return validationResult.isValid
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		// Проверяем валидность формы до сброса ошибки
		if (!validateForm()) {
			// Если валидация не прошла, то НЕ сбрасываем ошибку
			// Только обновляем видимость для анимации
			setIsErrorVisible(false)
			setTimeout(() => setIsErrorVisible(true), 50)
			return
		}
		setError(null)
		setValidationError(null)
		setSuccess(null)
		setIsErrorVisible(false)

		// Проверяем валидность формы
		if (!validateForm()) {
			return
		}

		setIsLoading(true)

		try {
			// Формируем данные для отправки
			const requestData: RegisterRequest = {
				username: formData.email,
				email: formData.email,
				password: formData.password,
				firstname: formData.firstName,
				lastname: formData.lastName
			}

			// Используем функцию register
			const response = await register(requestData)

			// Перенаправляем после успешной регистрации
			navigate('/home')
		} catch (err: any) {
			// Прямо отображаем сообщение об ошибке с бэка
			setError(err.message)
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
					{error && (
						<div className='mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm transition-opacity duration-300 ease-in-out'>
							{error}
						</div>
					)}

					<div className='grid grid-cols-2 gap-4 mb-4'>
						<Input
							placeholder='Имя'
							value={formData.firstName}
							onChange={e => {
								setFormData({...formData, firstName: e.target.value})
								if (isNameValid(e.target.value)) {
									setFieldErrors({...fieldErrors, firstName: false})
									if (validationError) validateForm()
								}
							}}
							icon={<PiSmiley />}
							error={fieldErrors.firstName}
						/>
						<Input
							placeholder='Фамилия'
							value={formData.lastName}
							onChange={e => {
								setFormData({...formData, lastName: e.target.value})
								if (isNameValid(e.target.value)) {
									setFieldErrors({...fieldErrors, lastName: false})
									if (validationError) validateForm()
								}
							}}
							error={fieldErrors.lastName}
						/>
					</div>

					<div className='space-y-4'>
						<Input
							type='email'
							placeholder='Электронная почта'
							value={formData.email}
							onChange={e => {
								setFormData({...formData, email: e.target.value})
								if (isEmailValid(e.target.value)) {
									setFieldErrors({...fieldErrors, email: false})
									if (validationError) validateForm()
								}
							}}
							icon={<IoMailOutline />}
							error={fieldErrors.email}
						/>
						<Input
							type='password'
							placeholder='Пароль'
							value={formData.password}
							onChange={e => {
								setFormData({...formData, password: e.target.value})
								if (isPasswordValid(e.target.value)) {
									setFieldErrors({...fieldErrors, password: false})
									if (validationError) validateForm()
								}
							}}
							icon={<SlLock />}
							error={fieldErrors.password}
						/>
					</div>

					{/* Плавно анимированное сообщение о валидации */}
					{validationError && (
						<div
							className={`mt-3 flex items-start space-x-2 text-red-500 text-sm transition-opacity duration-300 ease-in-out ${
								isErrorVisible ? 'opacity-100' : 'opacity-0'
							}`}>
							<MdOutlineInfo className='text-xl flex-shrink-0 mt-2.5 .5' />
							<p className='text-sm text-left'>
								Необходимо заполнить все подсвеченные
								<br />
								поля
							</p>
						</div>
					)}

					<div className='mt-5'>
						<Button type='submit' fullWidth disabled={isLoading}>
							{isLoading ? 'Регистрация...' : 'Создать аккаунт'}
						</Button>
					</div>
				</form>
				<p className='text-center text-xm text-gray-500 mt-4'>
					Уже зарегистрированы?{' '}
					<Link
						to='/login'
						className='font-medium text-blue-300 underline underline-offset-[3.5px] decoration-[1.5px] decoration-blue-200 hover:text-blue-600 hover:decoration-blue-500 transition-all duration-200'>
						Войти в аккаунт
					</Link>
				</p>
			</div>
		</div>
	)
}

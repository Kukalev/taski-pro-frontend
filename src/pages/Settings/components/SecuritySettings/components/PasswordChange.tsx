import {useState} from 'react'
import {
  UserSettingsService
} from '../../../../../services/userSettings/UserSettings'

export const PasswordChange = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Все поля должны быть заполнены')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Новые пароли не совпадают')
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log('Отправка запроса на смену пароля...', oldPassword, newPassword)
      await UserSettingsService.updateUser({ oldPassword, newPassword })
      setSuccess('Пароль успешно изменен')
      
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error("Ошибка при смене пароля:", err)
      setError(err.message || 'Не удалось изменить пароль. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Стиль для полей ввода
  const inputStyle = "p-1.5 bg-gray-50 rounded-lg w-full focus:outline-none placeholder-gray-400 hover:bg-gray-100 focus:bg-gray-100 disabled:opacity-50"

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 mr-4">
        <label htmlFor="old-password" className="block text-sm font-medium text-gray-700 mb-1">
          Старый пароль
        </label>
        <input
          id="old-password"
          type="password"
          className={inputStyle}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Введите старый пароль"
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-4 mr-4">
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
          Новый пароль
        </label>
        <input
          id="new-password"
          type="password"
          className={inputStyle}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Введите новый пароль"
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-4 mr-4">
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          Повторите пароль
        </label>
        <input
          id="confirm-password"
          type="password"
          className={inputStyle}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Введите новый пароль повторно"
          disabled={isLoading}
        />
      </div>
      
      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-50 text-green-600 rounded-md text-sm">
          {success}
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-200 hover:text-gray-500 focus:outline-none cursor-pointer transition-colors mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Изменение...' : 'Изменить пароль'}
        </button>
      </div>
    </form>
  )
} 
import {DeleteAccountProps} from '../types'
import {useState} from 'react'

export const DeleteAccount: React.FC<DeleteAccountProps> = ({ onLogout }) => {
  const [confirmDelete, setConfirmDelete] = useState(false)
  
  const handleDeleteAccount = () => {
    // Здесь должен быть запрос на удаление аккаунта
    console.log('Отправка запроса на удаление аккаунта')
    
    // После успешного удаления - выход из системы
    onLogout()
  }
  
  return (
    <div>
      <ul className="mb-4 list-disc list-inside text-gray-600 text-sm space-y-1">
        <li>аккаунт нельзя будет восстановить</li>
        <li>все сохранённые на аккаунте данные будут потеряны</li>
        <li>аккаунт будет скрыт у других пользователей</li>
      </ul>

        <div className="flex justify-end">
          <button 
            onClick={() => setConfirmDelete(true)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none  cursor-pointer transition-colors"
          >
            Удалить
          </button>
        </div>

    </div>
  )
} 
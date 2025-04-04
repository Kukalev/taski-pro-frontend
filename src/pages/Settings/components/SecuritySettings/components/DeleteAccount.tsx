import { DeleteAccountProps } from '../types'
import { useState } from 'react'

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
      <p className="text-gray-700 mb-4">
        Удаление аккаунта приведет к безвозвратной потере всех ваших данных:
      </p>
      
      <ul className="ml-6 mb-4 list-disc text-gray-600 text-sm">
        <li className="mb-1">аккаунт нельзя будет восстановить</li>
        <li className="mb-1">все сохранённые на аккаунте данные будут потеряны</li>
        <li className="mb-1">аккаунт будет анонимизирован у других пользователей</li>
      </ul>
      
      {!confirmDelete ? (
        <button 
          onClick={() => setConfirmDelete(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Удалить
        </button>
      ) : (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <p className="text-red-600 font-medium mb-3">
            Вы уверены, что хотите удалить аккаунт?
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Да, удалить
            </button>
            <button 
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 